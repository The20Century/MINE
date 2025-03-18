const { Pool } = require('pg');
require('dotenv').config();
const logger = require('../config/logger')
const pool = new Pool({
    user : process.env.PG_USER,
    host : process.env.PG_HOST,
    database : process.env.PG_DB,
    password : process.env.PG_PW,
    port : process.env.PG_PORT
})
// 채팅리스트페이지
const selectChattingList = async (userId, fLog) => {
    logger.info(fLog + '[selectChattingList][userId] ' + userId);
    const query = `
        SELECT
            room.room_id AS roomId,
            room.seller_id AS sellerId,
            seller.user_nickname AS sellerNickname,
            room.buyer_id AS buyerId,
            buyer.user_nickname AS buyerNickname,
            room.item_id AS itemId,
            room.item_type AS itemType,
            CASE
                WHEN room.item_type = 'Auction' THEN auction.auction_item_name
                WHEN room.item_type = 'Used' THEN used.used_item_name
            ELSE NULL
            END AS itemName ,
            chat.chatting_content AS lastMessage,
            chat.created_at AS lastMessageTime,
            CASE
                WHEN room.seller_id = ${userId} THEN room.buyer_id
                ELSE room.seller_id
            END AS receiver
        FROM
            tbl_chatting_room AS room
                LEFT JOIN tbl_user AS seller ON room.seller_id = seller.user_id
                LEFT JOIN tbl_user AS buyer ON room.buyer_id = buyer.user_id
                LEFT JOIN tbl_auction_item AS auction
                          ON room.item_type = 'Auction'
                              AND room.item_id = auction.auction_item_id
                LEFT JOIN tbl_used_item AS used
                          ON room.item_type = 'Used'
                              AND room.item_id = used.used_item_id
                LEFT JOIN (
                SELECT *
                FROM tbl_chatting c1
                WHERE c1.created_at = (
                    SELECT MAX(c2.created_at)
                    FROM tbl_chatting c2
                    WHERE c2.room_id = c1.room_id AND c2.is_deleted = FALSE
                )
            ) AS chat ON room.room_id = chat.room_id
        WHERE
            room.seller_id = ${userId} OR room.buyer_id = ${userId}
        ORDER BY
            chat.created_at DESC;
    `;

    try {
        logger.info(fLog + '[selectChattingList][query] ' + query);
        const result = await pool.query(query);
        const chattingList = result.rows.map((prev) => ({
            sellerId : prev.sellerid,
            buyerId : prev.buyerid,
            sellerNickname : prev.sellernickname,
            buyerNickname : prev.buyernickname,
            itemId : prev.itemid,
            itemType : prev.itemtype,
            itemName : prev.itemname,
            lastMessage : prev.lastmessage,
            lastMessageTime : prev.lastmessagetime,
            receiver : prev.receiver,
            sender : userId
        }))
        logger.info(fLog + '[selectChattingList][ChattingList] ' + JSON.stringify(chattingList));
        return chattingList;
    } catch (error) {
        logger.info(fLog + '[selectChattingList][error] 대화 내용 조회 실패  : ' + error);
        throw error;
    }
}

const selectUserByBuyerId = async (data,fLog)  => {
    const query = `
        select * from tbl_user
        where user_id = ${data.buyerId}
    `
    logger.info(fLog+'[selectUserByBuyerId][query] ' + query)
    try {
        const result = await pool.query(query);
        logger.info(fLog+'[selectUserByBuyerId][result] ' + result.rows[0])
        return result.rows[0];
    } catch (error) {
        logger.info(fLog+'[selectUserByBuyerId][fail select usedItem] ' + error)
        throw error;
    }
}

const selectItemById = async (data, fLog) => {
    const query = `
        select a.*, b.* from tbl_used_item a, tbl_user b 
        where a.user_id = b.user_id and used_item_id = ${data.itemId}
    `
    logger.info(fLog+'[selectItemById] ' + query)
    try {
        const result = await pool.query(query);
        logger.info(fLog+'[selectItemById][result] ' + result)
        return result.rows[0];
    } catch (error) {
        logger.error(fLog+'[selectItemById][fail select usedItem] ' + error)
        throw error;
    }
}

const selectRoomId = async (data, fLog) =>{
    const roomSelectQuery = `
        SELECT 
            room_id 
        FROM 
            tbl_chatting_room
        WHERE 
            seller_id = $1
            AND buyer_id = $2
            AND item_id = $3
            AND item_type = $4
    `
    const values = [data.sellerId, data.buyerId, data.itemId, data.itemType];
    logger.info(fLog + '[roomSelectQuery][query] ' + roomSelectQuery)
    try {
        const result = await pool.query(roomSelectQuery, values);
        logger.info(fLog + '[roomSelectQuery][roomId] ' + result.rows[0].room_id)
        // console.log(result.rows)
        return result.rows[0].room_id;
    } catch (error) {
        logger.info(fLog + '[roomSelectQuery][fail select roomId] ' +error)
        throw error;
    }

}

const selectOrInsertChattingRoom = async (data, fLog) => {
    const roomSelectQuery = `
        SELECT room_id FROM tbl_chatting_room
        WHERE 
                room_id = (
                    SELECT 
                        room_id 
                    FROM 
                        tbl_chatting_room
                    WHERE 
                        seller_id = $1
                        AND buyer_id = $2
                        AND item_id = $3
                        AND item_type = $4
                )
    `
    const selectQuery = `
            SELECT 
                chatting_id,
                chatting_sending_user_id,
                chatting_receive_user_id,
                chatting_content,
                created_at,
                updated_at,
                room_id,
                item_id,
                item_type,
                COALESCE(images, '[]'::jsonb) AS images, -- JSONB 형식 기본값 설정
                CASE
                    WHEN COALESCE(images, '[]'::jsonb) = '[]'::jsonb THEN 'text' -- 빈 배열인 경우 'text' 반환
                    ELSE 'images'
                    END AS message
            FROM 
                tbl_chatting    
            WHERE 
                room_id = (
                    SELECT 
                        room_id 
                    FROM 
                        tbl_chatting_room
                    WHERE 
                        seller_id = $1
                        AND buyer_id = $2
                        AND item_id = $3
                        AND item_type = $4
                )
            ORDER BY 
                created_at ASC;
        `;

    const insertQuery = `
            INSERT INTO tbl_chatting_room (
                seller_id,
                buyer_id,
                item_id,
                item_type,
                created_at,
                updated_at
            )
            VALUES ($1, $2, $3, $4, NOW(), NOW())
            RETURNING room_id;
        `;

        const values = [data.sellerId, data.buyerId, data.itemId, data.itemType];
        let result
        try {
            logger.info(fLog+'[selectOrInsertChattingRoom][roomSelectQuery] ' + roomSelectQuery)
            let selectRoom = await pool.query(roomSelectQuery, values);
            if(selectRoom.rows.length !== 0){
                result = await pool.query(selectQuery, values);
                logger.info(fLog+'[selectOrInsertChattingRoom][roomSelectQuery][result] ' + result)
            }else{
                const insertResult = await pool.query(insertQuery, values);
                logger.info(fLog+'[selectOrInsertChattingRoom][insertQuery] ' + insertQuery)
                const roomId = insertResult.rows[0].room_id;
                logger.info(fLog+'[selectOrInsertChattingRoom][insertQuery][RoomId 채팅방 생성] ' + roomId)
                result = await pool.query(
                    `
                            SELECT 
                                chatting_id,
                                chatting_sending_user_id,
                                chatting_receive_user_id,
                                chatting_content,
                                created_at,
                                updated_at,
                                room_id,
                                item_id,
                                item_type,
                                COALESCE(images, '[]'::jsonb) AS images, -- JSONB 형식 기본값 설정
                                CASE
                                    WHEN COALESCE(tc.images, '[]'::jsonb) = '[]'::jsonb THEN 'text' -- 빈 배열인 경우 'text' 반환
                                    ELSE 'images'
                                    END AS message
                            FROM 
                                tbl_chatting    
                            WHERE 
                                room_id = $1
                            ORDER BY 
                                created_at ASC;
                            `,
                    [roomId]
                );

            }
            logger.info(fLog+'[selectOrInsertChattingRoom][대화 내용] ' + JSON.stringify(result.rows))
            return result.rows; // 최종 데이터 반환
        } catch (error) {
            logger.error(fLog+'[selectOrInsertChattingRoom][대화 내용 조회 실패] ' + error)
            throw error;
        }
}

const selectChatting = async (data, fLog) => {
    let query;
    let values;

    if (!data.roomId) {
        // roomId가 없는 경우 쿼리
        query = `
            SELECT
                tc.chatting_id,
                tc.chatting_sending_user_id,
                tc.chatting_receive_user_id,
                tc.chatting_content,
                tc.created_at,
                tc.updated_at,
                tc.room_id,
                tc.item_id,
                tc.item_type,
                COALESCE(images, '[]'::jsonb) AS images,
                CASE
                    WHEN COALESCE(tc.images, '[]'::jsonb) = '[]'::jsonb THEN 'text'
                    ELSE 'images'
                    END AS message,
                tcr.chatting_read_id,
                tcr.user_id AS reader_user_id,
                tcr.chatting_read_status,
                tcr.created_at AS read_created_at,
                tcr.updated_at AS read_updated_at
            FROM
                tbl_chatting tc
                    LEFT JOIN tbl_chatting_read tcr
                              ON tc.chatting_id = tcr.chatting_id
            WHERE
                tc.room_id = (
                    SELECT room_id
                    FROM tbl_chatting_room
                    WHERE seller_id = $1
                      AND buyer_id = $2
                      AND item_id = $3
                      AND item_type = $4
                )
            ORDER BY tc.created_at ASC;
        `;
        values = [data.sellerId, data.buyerId, data.itemId, data.itemType];
    } else {
        // roomId가 있는 경우 쿼리
        query = `
            SELECT
                tc.chatting_id,
                tc.chatting_sending_user_id,
                tc.chatting_receive_user_id,
                tc.chatting_content,
                tc.created_at,
                tc.updated_at,
                tc.room_id,
                tc.item_id,
                tc.item_type,
                COALESCE(images, '[]'::jsonb) AS images,
                CASE
                    WHEN COALESCE(tc.images, '[]'::jsonb) = '[]'::jsonb THEN 'text'
                    ELSE 'images'
                    END AS message,
                tcr.chatting_read_id,
                tcr.user_id AS reader_user_id,
                tcr.chatting_read_status,
                tcr.created_at AS read_created_at,
                tcr.updated_at AS read_updated_at
            FROM
                tbl_chatting tc
                    LEFT JOIN tbl_chatting_read tcr
                              ON tc.chatting_id = tcr.chatting_id
            WHERE
                tc.room_id = $1
            ORDER BY tc.created_at ASC;
        `;
        values = [data.roomId];
    }

    try {
        const result = await pool.query(query, values);
        logger.info(fLog+'[selectChatting][query]' + query)
        const chatRows = result.rows;
        // 읽지 않은 메시지 필터링 (내가 받은 메시지만 포함)
        const unreadChatIds = chatRows
            .filter(chat =>
                chat.reader_user_id === data.receive && // 수신자가 읽지 않은 메시지
                !chat.chatting_read_status && // 읽지 않은 메시지
                chat.chatting_receive_user_id === data.sender // 내가 받은 메시지만
            )
            .map(chat => chat.chatting_id);

        logger.info(fLog+'[selectChatting][unreadChatIds] ' + unreadChatIds)
        // console.log(chatRows)
        // 읽지 않은 메시지가 있으면 업데이트
        if (unreadChatIds.length > 0) {
            const updateQuery = `
                UPDATE tbl_chatting_read
                SET chatting_read_status = TRUE, updated_at = NOW()
                WHERE chatting_id = ANY($1) AND user_id = $2;
            `;
            const updateValues = [unreadChatIds, data.receive];
            await pool.query(updateQuery, updateValues);
            logger.info(fLog+'[selectChatting][success Read] ' + unreadChatIds)
        }
        return chatRows; // 대화 내역 반환
    } catch (error) {
        logger.error(fLog+'[selectChatting][fail Read] ' + error)
        throw error;
    }
};

const insertChatting = async (chatData) => {
    const client = await pool.connect(); // 트랜잭션을 위해 client 연결
    try {
        await client.query('BEGIN'); // 트랜잭션 시작

        // 메시지 저장
        const chatQuery = `
            INSERT INTO tbl_chatting (
                chatting_sending_user_id,
                chatting_receive_user_id,
                item_id,
                chatting_content,
                room_id,
                is_deleted,
                created_at,
                updated_at,
                images
            )
            VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW(), $7)
            RETURNING *;
        `;
        const chatValues = [
            chatData.chatting_sending_user_id,
            chatData.chatting_receive_user_id,
            chatData.item_id,
            chatData.chatting_content,
            chatData.room_id,
            chatData.is_deleted,
            chatData.images
        ];
        const chatResult = await client.query(chatQuery, chatValues);
        const savedChat = chatResult.rows[0];

        // 읽음 처리 데이터 삽입 (수신자용)
        const readQuery = `
            INSERT INTO tbl_chatting_read (
                chatting_id,
                user_id,
                chatting_read_status,
                created_at,
                updated_at
            )
            VALUES ($1, $2, $3, NOW(), NOW());
        `;
        const readValues = [
            savedChat.chatting_id,      // 저장된 채팅 ID
            chatData.chatting_receive_user_id, // 읽음 대상 사용자 (수신자)
            false                      // 기본 읽음 상태는 false
        ];
        await client.query(readQuery, readValues);

        await client.query('COMMIT'); // 트랜잭션 커밋
        return savedChat;
    } catch (error) {
        await client.query('ROLLBACK'); // 에러 발생 시 롤백
        console.error('DB Insert Error:', error);
        throw error;
    } finally {
        client.release(); // 연결 해제
    }

}

const unReadMsgCount = async (userId) => {
    const query = `select count(*) from tbl_chatting_read where user_id = ${userId} and chatting_read_status = false`
    try {
        const result = await pool.query(query);
        // console.log(result.rows)
        return result.rows[0];
    } catch (error) {
        console.error('::', error);
        throw error;
    }
}

const selectRoomData = async (data,fLog) => {
    const query = `
        SELECT
            item.used_item_name,
            item.used_item_price,
            item.used_item_id,
            receive.user_id AS receive_id,
            receive.user_nickname AS receive_nickname,
            receive.user_trust_score AS receive_trust_score,
            sender.user_id AS sender_id,
            sender.user_nickname AS sender_nickname,
            sender.user_trust_score AS sender_trust_score
        FROM
            (
                SELECT
                    used_item_name,
                    used_item_price,
                    used_item_id
                FROM tbl_used_item
                WHERE used_item_id = ${data.itemId}
            ) item,
            (
                SELECT
                    user_id,
                    user_nickname,
                    user_trust_score
                FROM tbl_user
                WHERE user_id = ${data.receive}
            ) receive,
            (
                SELECT
                    user_id,
                    user_nickname,
                    user_trust_score
                FROM tbl_user
                WHERE user_id = ${data.sender}
            ) sender
    `
    try {
        logger.info(fLog+'[selectRoomData][query] ' + query)
        const result = await pool.query(query);
        logger.info(fLog+'[selectRoomData][result] ' + JSON.stringify(result))
        const roomData = {
            itemName : result.rows[0].used_item_name,
            itemPrice : result.rows[0].used_item_price,
            itemId : result.rows[0].used_item_id,
            receive : result.rows[0].receive_id,
            receiveNickName : result.rows[0].receive_nickname,
            receiveTrustScore : result.rows[0].receive_trust_score,
            sender : result.rows[0].sender_id,
            senderNickName: result.rows[0].sender_nickname,
            senderTrustScore:  result.rows[0].sender_trust_score
        }

        logger.info(fLog+'[selectRoomData][roomData] ' + JSON.stringify(roomData))
        return roomData;
    } catch (error) {
        logger.info(fLog+'[selectRoomData][fail select roomData] ' + error)
        throw error;
    }
}
module.exports = {
    pool:pool,
    selectChatting : selectChatting,
    insertChatting : insertChatting,
    selectChattingList : selectChattingList,
    selectItemById : selectItemById,
    selectUserByBuyerId : selectUserByBuyerId,
    selectOrInsertChattingRoom : selectOrInsertChattingRoom,
    selectRoomId : selectRoomId,
    unReadMsgCount : unReadMsgCount,
    selectRoomData : selectRoomData
}
