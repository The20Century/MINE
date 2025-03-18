import {
    textMessageArray,
    sendMessage,
    chatDrawerState,
    chatListAndRoomState,
    chattingRoomSeller
} from '../../../recoil/atoms/chatStateAtom'
import {useRecoilState, useRecoilValue} from 'recoil';
import { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import TextMessageComponent from '../../components/Chat/TextMessageComponent'
import ImageMessageComponent from '../../components/Chat/ImageMessageComponent'
import {authState} from "../../../recoil/atoms/loginUserAtom.js";
import {useNavigate} from "react-router-dom";
const ChattingRoomContainer = () => {
    // chatting room 번호
    const auth = useRecoilValue(authState)
    const [chatContainerState,setChatContainerState] = useRecoilState(chatListAndRoomState);
    const [socket, setSocket] = useState(null); // 소켓 상태 관리
    const [message, setMessage] = useRecoilState(textMessageArray);
    const [sndMsg, setSndMsg] = useRecoilState(sendMessage);
    const [drawerVisible,setDrawerVisible] = useRecoilState(chatDrawerState); // 드로어 상태
    const roomData = useRecoilValue(chattingRoomSeller);
    const messageEndRef = useRef(null);
    const nav = useNavigate();

    useEffect(() => {
        console.log('mount')
        console.log(roomData)
        setSocket(null);
    }, [chatContainerState, drawerVisible]);

    useEffect(() => {
        console.log('roomId : ', roomData.roomId)
        console.log('socket' + socket)

        console.log("roomData.roomId"+ roomData.roomId)
        console.log("roomData.receive"+ roomData.receive)

        if(drawerVisible && roomData.roomId && socket == null){

            const newSocket = io('http://localhost:3080/chatting', {
                // transports : ["websocket"],
                withCredentials: true,
                extraHeaders: {
                    chattingRoom: roomData.roomId,
                    receiver : roomData.receive,
                }
            });
            setSocket(newSocket)

            // 소켓 연결 확인
            newSocket.on('connect', () => {
                console.log('연결: ' + newSocket.id);
            });
            newSocket.emit('joinRoom', {
                // userId: loginUser, // 로그인한 사용자 ID
                roomId: roomData.roomId, // 현재 방 ID
            })

            // 서버에서 메시지를 받으면 콘솔에 출력
            newSocket.on('message', (message) => {
                console.log("message.text ::::; ", JSON.stringify(message.userEmail === auth.userEmail))
                console.log("auth.userEmail ::::; ", JSON.stringify(auth.userEmail))
                console.log("message.userEmail ::::; ", JSON.stringify(message.userEmail))

                if (message && message.sender) { // 유효성 검사
                    setMessage((prev) => [
                        ...prev,
                        {
                            chatting_id : message.chatting_id,
                            message: message.message || 'text', // 기본값 설정
                            text: message.text,
                            // type: message.sender === loginUser ? "send" : "receive",
                            type : message.userEmail === auth.userEmail ? "send" : "receive",
                            sender : message.sender,
                            time: message.time,
                            read: message.read,
                            images : message.images
                        }
                    ]);
                } else {
                    console.error('유효하지 않은 메시지:', message);
                }
            });

            // 연결이 끊겼을 때
            newSocket.on('disconnect', (err) => {
                console.error(newSocket.id+ ' Disconnected: ' + err);
            });

            newSocket.on('authError', async (data) => {
                console.error(data.message)

                setDrawerVisible(false)
                nav('/login');
            })

        }
    }, [chatContainerState, drawerVisible, nav, setDrawerVisible /*socket, , chatId, loginUser, roomData, setMessage*/]);

    useEffect(() => {
        if(!drawerVisible){
            if(socket != null){
                socket.disconnect();
            }
        }
    }, [drawerVisible]);

    useEffect(() => {
        if (socket) {
            // 읽음 상태 업데이트 이벤트 수신
            socket.on('read', ({ chatting_ids }) => {
                console.log('읽음 상태 업데이트 수신:', chatting_ids);
                console.log(":마 들어오나")
                // 읽음 상태 업데이트
                setMessage((prevMessages) =>
                    prevMessages.map((msg) =>
                        chatting_ids.includes(msg.chatting_id)
                            ? { ...msg, read: true }
                            : msg
                    )
                );
            });
        }

        return () => {
            if (socket) {
                socket.off('messageRead');
            }
        };
    }, [socket, roomData.roomId, setMessage]);

    useEffect(() => {
        console.log(socket)
        if(socket != null){
            if (sndMsg.message === 'text') {
                if (sndMsg.text && sndMsg.text.trim()) {
                    console.log("text sndMsg" + JSON.stringify(sndMsg))
                    socket.emit('message', sndMsg);
                }
            } else {
                console.log("image sndMsg" + JSON.stringify(sndMsg))
                socket.emit('message', sndMsg)
            }
        }else{
        }
    }, [sndMsg]);




    const scrollToBottom = () => {
        messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };
    // message 배열이 업데이트될 때마다 스크롤 내림
    useEffect(() => {
        scrollToBottom();
    }, [message]);

    return (
        <>
            <div className="flex flex-col w-full h-full justify-between">
                <div className="min-h-[70px] basis-[70px] flex justify-center items-center px-[20px]">
                    <button className="w-10 h-10 basis-10"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none"
                        onClick={() => {
                            if(socket != null) {
                                socket.disconnect()
                            }
                            setChatContainerState("listContainer")
                        }}
                    >
                            <path stroke="#141313" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="m12.5 19.5-8.075-7.125a.5.5 0 0 1 0-.75L12.5 4.5"></path>
                        </svg>
                    </button>
                    <h2 className="flex flex-col md:flex-row justify-center items-center md:space-x-2 flex-1 text-lg font-semibold text-center text-jnGray-900 cursor-pointer">
                        <p className="mb-0">
                            <span className="flex items-center justify-center space-x-2">
                                <span>{roomData.nickName}</span>
                                <span className="text-[11px] text-[#0CB650] border border-jngreen px-2 rounded-2xl h-5 leading-5">{roomData.trust}</span>
                            </span>
                        </p>
                        <p className="text-[12px] text-gray-400 h-4">보통 2시간 이내 응답</p>
                    </h2>
                    <div>
                        <div className="flex gap-[8px]">
                            {/*<button>*/}
                            {/*    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none">*/}
                            {/*        <path stroke="#141313" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" d="M9.095 12.116A8.05 8.05 0 0 0 2.2 20.082h12.506M10.254 12.029q-.594 0-1.16.087"></path>*/}
                            {/*        <path fill="#fff" stroke="#141313" strokeMiterlimit="10" strokeWidth="1.6" d="M13.583 7.264a3.464 3.464 0 1 0-6.929 0v1.303a3.464 3.464 0 1 0 6.929 0z"></path>*/}
                            {/*        <path fill="#fff" d="M15.942 12.386a4.41 4.41 0 0 1 4.404 4.403 4.4 4.4 0 0 1-4.404 4.404 4.4 4.4 0 0 1-4.403-4.404 4.4 4.4 0 0 1 4.403-4.403m0 7.262a2.864 2.864 0 0 0 2.858-2.859 2.864 2.864 0 0 0-2.858-2.858 2.864 2.864 0 0 0-2.858 2.858 2.864 2.864 0 0 0 2.858 2.859m0-8.517a5.667 5.667 0 0 0-5.659 5.658c0 3.12 2.54 5.66 5.66 5.66 3.118 0 5.658-2.54 5.658-5.66s-2.54-5.659-5.659-5.659m0 7.261a1.605 1.605 0 0 1-1.603-1.603 1.6 1.6 0 0 1 1.603-1.603 1.6 1.6 0 0 1 1.603 1.603 1.6 1.6 0 0 1-1.603 1.603"></path>*/}
                            {/*        <path fill="#fff" stroke="#141313" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" d="M15.944 20.41a3.627 3.627 0 0 0 3.63-3.63 3.627 3.627 0 0 0-3.63-3.631 3.627 3.627 0 0 0-3.632 3.63 3.627 3.627 0 0 0 3.632 3.632"></path>*/}
                            {/*        <path stroke="#141313" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" d="m21.062 21.743-2.569-2.337"></path>*/}
                            {/*    </svg>*/}
                            {/*</button>*/}
                            {/*<button>*/}
                            {/*    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none">*/}
                            {/*        <path fill="#141313" stroke="#141313" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.25" d="M12 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2M12 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2M12 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2"></path>*/}
                            {/*    </svg>*/}
                            {/*</button>*/}
                        </div>
                    </div>
                </div>
                <div className="h-full overflow-auto">
                    <div className="flex flex-col justify-between w-full h-full">
                        <div className="bg-white w-full flex gap-2 px-3 py-4 items-center">
                            <a className="flex flex-grow h-10 gap-4" href="/product/115257819">
                                <div className="relative w-10 h-10 aspect-square">
                                    <img alt="상품 썸네일" src="https://img2.joongna.com/media/original/2023/06/05/1685922131019iUp_CAfIn.jpg?impolicy=thumb" decoding="async" data-nimg="fill" className="rounded-md" loading="lazy" style={{position: "absolute", height: "100%", width: "100%", inset: "0px", color: "transparent"}} />
                                </div>
                                <div>
                                    <div className="flex items-center">
                                        <span className="font-semibold text-[15px] text-jnGray-900">{roomData.itemPrice}</span>
                                        <span className="text-[12px] text-jnGray-500 ml-2">배송비 별도</span>
                                    </div>
                                    <span className="block text-[12px]">{roomData.itemName}</span>
                                </div>
                            </a>
                            </div>
                        <div className="p-5 bg-[#e9edef] overflow-auto h-full">
                            <div></div>
                            <div className="w-inherit h-full flex flex-col justify-between">
                                <div>

                                    {
                                        message.map((data, i) => {
                                            return (
                                                <div key={i}>
                                                    {data.message == 'text' ? (
                                                            <TextMessageComponent data={data.text ? data : { ...data, text: '내용 없음' }} />
                                                        ) : (
                                                            <ImageMessageComponent data={data}/>
                                                        )
                                                    }

                                                </div>
                                            )
                                            })

                                    }
                                    <div ref={messageEndRef} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="carouselWrapper relative pt-1.5 pb-2.5 pl-1 pr-2.5 h-[44px] quick-menu-slider-wrapper" style={{height: 0, paddingTop: "0", paddingBottom: "5px"}}></div>
                <SendChattingArea setSendMessage={setSndMsg} scrollToBottom={scrollToBottom}/>
            </div>
        </>
    )
}

export default ChattingRoomContainer;

const SendChattingArea = ({setSendMessage, scrollToBottom}) => {
    const [text, setText] = useState('');
    const roomData = useRecoilValue(chattingRoomSeller);
    const handleFileUpload = async(e) => {
        const files = e.target.files;
        const formData = new FormData();
        if (files.length > 0) {
          // 선택된 파일 배열을 처리하는 코드
          for (let i = 0; i < files.length; i++) {
            formData.append('files', files[i]);
          }

          try {
            const res = await fetch('/chat/upload', {
                method: 'POST',
                headers : {
                    uploadState: true
                },
                body: formData,
              });
            const result = await res.json();
            if(result.success){
                const updatedImages = result.urls.map((url) => ({url}));
                setSendMessage((prev) => ({
                    ...prev,
                    message: 'image',
                    images: updatedImages,
                    receiver: roomData.receive,
                    text: '',
                    itemId : roomData.itemId,
                    time: new Date(),
                }));

            }
          } catch (error) {
            console.error('파일 업로드 실패:', error);
          }
        }
      };
    const handleTextChange = (e) => {
        setText(e.target.value);
    }
    
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!text.trim()) return;
        console.log(roomData.itemId)
        await setSendMessage(prev => ({
            ...prev,
            receiver: roomData.receive,
            message: 'text',
            text: text,
            itemId : roomData.itemId,
            time: new Date(),
            images : ''
        }));
        
        setText('');  // 전송 후 초기화
    };
    const handleKeyUp = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            console.log(":::::::::::::::::::::::::::::: 렌더링 되고 이거 바로 나가나?")
            e.preventDefault();
            handleSubmit(e);
        }
    };
    // 입력 후 스크롤 아래로
    useEffect(() => {
        scrollToBottom()
    },[text])


    return (
        <>
            <div>
                <form className="bg-[#F7F9FA] py-3 px-3 flex flex-col rounded-xl focus-within:shadow-banner h-auto"  onSubmit={handleSubmit}>
                    <textarea title="채팅" autoComplete="off" maxLength="1000" className="shrink-0 bg-transparent placeholder:text-[#9CA3AF] outline-none resize-none text-md h-16 w-full pre-wrap" placeholder="메시지를 입력해주세요" name="chat" value={text} style={{height: "6rem"}}
                    onKeyDown={handleKeyUp}
                    onChange={(e) => {
                        handleTextChange(e);
                        if (!e.target.value.trim()) {
                            return;
                        }
                    } } ></textarea>
                    <div className="flex justify-between mt-3">
                        <div className="flex gap-2">
                            <div>
                                <div className="block">
                                    <label htmlFor="chat-image-upload" className="text-gray-600 font-semibold text-sm leading-none cursor-pointer block border-[#e1e1e1] text-center border-0 m-0 p-0 w-6 h-6">
                                        <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 16 16" className="w-full h-full" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                                            <path fillRule="evenodd" d="M.002 3a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2h-12a2 2 0 01-2-2V3zm1 9l2.646-2.354a.5.5 0 01.63-.062l2.66 1.773 3.71-3.71a.5.5 0 01.577-.094L15.002 9.5V13a1 1 0 01-1 1h-12a1 1 0 01-1-1v-1zm5-6.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" clipRule="evenodd"></path>
                                        </svg>
                                    </label>
                                    <input id="chat-image-upload" name="chat-image-upload" type="file" className="px-4 md:px-5 appearance-none border text-input text-xs lg:text-sm font-body placeholder-body min-h-12 transition duration-200 ease-in-out bg-gray-100 border-gray-300 focus:shadow focus:bg-white focus:border-primary a11yHidden w-auto py-0 rounded-md" autoComplete="off" spellCheck="false" aria-invalid="false" accept="image/png, image/jpeg, image/jpg" multiple onChange={handleFileUpload} />
                                </div> 
                            </div>
                        </div>
                        <div className="flex items-end space-x-2">
                            <span className="text-sm leading-5 text-gray-400">{text.length} / 1000</span>
                                <button type="submit" disabled={!text.trim()} className="w-6 h-6"><svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" className="w-full h-full fill-[#9CA3AF]" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M8 256C8 119 119 8 256 8s248 111 248 248-111 248-248 248S8 393 8 256zm143.6 28.9l72.4-75.5V392c0 13.3 10.7 24 24 24h16c13.3 0 24-10.7 24-24V209.4l72.4 75.5c9.3 9.7 24.8 9.9 34.3.4l10.9-11c9.4-9.4 9.4-24.6 0-33.9L273 107.7c-9.4-9.4-24.6-9.4-33.9 0L106.3 240.4c-9.4 9.4-9.4 24.6 0 33.9l10.9 11c9.6 9.5 25.1 9.3 34.4-.4z"></path>
                                </svg>
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </>
    )
}