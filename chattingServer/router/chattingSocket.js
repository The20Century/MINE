const socketIo = require('socket.io');
const redisClient = require('../service/redisClient');
const dbService = require('../service/postgresService');
const {getSessionData} = require('../service/sessionService')
const cookie = require('cookie')

const chattingSocket = (server) => {
    const io = socketIo(server, {
        cors: {
            origin: "http://localhost:5173",
            methods: ["GET", "POST"],
            credentials: true, // 쿠키 허용
        }
    });

    const chatNamespace = io.of('/chat'); // '/chat' 네임스페이스 생성

    chatNamespace.on('connection',async (chatSocket) => {
        let { chattingroom,receiver} = chatSocket.handshake.headers;
        const cookies = cookie.parse(chatSocket.handshake.headers.cookie || '');
        const sessionId = atob(cookies['SESSIONID']);
        console.log("::::::::::::::::::::::::"+ sessionId)


        console.log(`새로운 클라이언트 연결: ${chatSocket.id}`);



        const session = await getSessionData(sessionId);
        if(!session){
            chatSocket.emit('authError', {status : false, message : 'session 만료'})
            chatSocket.disconnect();
            return;
        }


        const userId = session.userInfo.userId
        let sender = session.userInfo.userId
        console.log(`채팅방 ID: ${chattingroom}, 발신자: ${sender}, 수신자: ${receiver}`);

        // 클라이언트를 해당 채팅방(room)에 조인
        chatSocket.join(chattingroom);
        console.log(`${chatSocket.id} 채팅방 ${chattingroom}에 참여`);

        // 방에 새로 들어왔을 때 읽지 않은 메시지를 읽음 처리
        chatSocket.on('joinRoom', async ({ roomId }) => {
            console.log(`사용자 ${userId}가 방 ${roomId}에 입장`);
            try {
                // `tbl_chatting_read`와 `tbl_chatting`을 조인하여 room_id를 기준으로 읽지 않은 메시지 가져오기
                const unreadQuery = `
                    SELECT r.chatting_id
                    FROM tbl_chatting_read r
                             INNER JOIN tbl_chatting c ON r.chatting_id = c.chatting_id
                    WHERE c.room_id = $1 AND r.user_id = $2 AND r.chatting_read_status = FALSE;
                `;
                const unreadResult = await dbService.pool.query(unreadQuery, [roomId, userId]);
                const unreadMessageIds = unreadResult.rows.map(row => row.chatting_id);

                // 읽음 처리
                if (unreadMessageIds.length > 0) {
                    const updateQuery = `
                        UPDATE tbl_chatting_read
                        SET chatting_read_status = TRUE, updated_at = NOW()
                        WHERE chatting_id = ANY($1) AND user_id = $2;
                    `;
                    await dbService.pool.query(updateQuery, [unreadMessageIds, userId]);

                    // 읽음 상태 업데이트 브로드캐스트
                    chatNamespace.to(chattingroom).emit('read', {
                        chatting_ids: unreadMessageIds,
                    });
                    console.log('읽음 상태 업데이트 완료:', unreadMessageIds);
                }
            } catch (error) {
                console.error('읽음 처리 실패:', error);
            }
        });

        // 메시지 수신
        chatSocket.on('message', async (message) => {
            console.log(`메시지 받음: ${JSON.stringify(message)}`);

            try {
                let roomClients = chatNamespace.adapter.rooms.get(chattingroom) || new Set();
                let isReceiverConnected = roomClients.size > 1 ? true : false;
                console.log(":::::::::::::: isReceiverConnected     :::::::::: "+ isReceiverConnected);
                // 메시지 저장
                const savedChat = await dbService.insertChatting({
                    // chatting_sending_user_id: message.sender,
                    chatting_sending_user_id: sender,
                    chatting_receive_user_id: message.receiver,
                    item_id: message.itemId,
                    chatting_content: message.text,
                    room_id: chattingroom,
                    is_deleted: false,
                    images: JSON.stringify(message.images || [])
                });

                console.log("메시지 저장 완료:", savedChat);

                if (isReceiverConnected || String(message.receiver) === String(sender)) {
                    console.log('읽음 상태 업데이트 진행');
                    const readQuery = `
                        UPDATE tbl_chatting_read
                        SET chatting_read_status = TRUE, updated_at = NOW()
                        WHERE chatting_id = $1 AND user_id = $2;
                    `;
                    await dbService.pool.query(readQuery, [savedChat.chatting_id, message.receiver]);
                    console.log('읽음 상태 업데이트 완료');
                }
                console.log({
                    ...message,
                    chatting_id: savedChat.chatting_id,
                    read: isReceiverConnected
                })
                // 동일한 채팅방(room)에 있는 클라이언트에게 메시지 전달
                chatNamespace.to(chattingroom).emit('message', {
                    ...message,
                    sender : userId,
                    chatting_id: savedChat.chatting_id,
                    read: isReceiverConnected,
                    userEmail : session.userInfo.userEmail
                });

            } catch (error) {
                console.error('메시지 저장 실패:', error);
            }
        });

        // 연결 해제 처리
        chatSocket.on('disconnect', async (reason) => {
            console.log(`클라이언트 연결 해제: ${chatSocket.id}, 이유: ${reason}, roomId :${chattingroom}`);
            try {
                let roomClients = chatNamespace.adapter.rooms.get(chattingroom) || new Set();

                // 상대방이 방에 접속해 있는지 확인
                if(roomClients.size === 0){
                    const query = `
                    SELECT COUNT(*) AS message_count
                    FROM tbl_chatting
                    WHERE room_id = $1 
                    `;
                    const result = await dbService.pool.query(query, [chattingroom]);
                    const messageCount = result.rows[0].message_count;
                    // console.log(typeof messageCount)

                    if (parseInt(messageCount) === 0) {
                        // 3. 메시지가 없으면 방 삭제
                        const deleteQuery = `
                        DELETE FROM tbl_chatting_room
                        WHERE room_id = $1
                        `;
                            await dbService.pool.query(deleteQuery, [chattingroom]);
                            console.log(`빈 채팅방 삭제 완료: ${chattingroom}`);
                    }else{
                        console.log(`방에 메시지가 있어 삭제하지 않음: ${chattingroom}`);
                    }
                }else{
                    console.log(`다른 사용자가 방에 남아있음: ${chattingroom}`);
                }
            }catch (e) {
                console.error(`방 삭제 처리 실패: ${e}`);
            }
        });

        chatSocket.on('error', (err) => {
            console.error('소켓 에러 발생:', err);
        });
    });
};

module.exports = chattingSocket;