import React, { useEffect } from 'react';
import {
    chatDrawerState,
    chatListAndRoomState,
    chattingRoomSeller, textMessageArray
} from '../../../recoil/atoms/chatStateAtom';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import {authState} from '../../../recoil/atoms/loginUserAtom';
import {getChattingList, getMessage} from '../../../services/chatService';
import { useQuery } from 'react-query';
import LoadingSpinner from '../../components/Common/LoadingSpinner.jsx';
import {processMessages} from "../../../recoil/selectors/chatSelector.js";
import {useNavigate} from "react-router-dom";
import {sessionCheck} from "../../../services/sessionCheckApi.js";


const ChattingListContainer = () => {
    const [drawerVisible,setDrawerVisible] = useRecoilState(chatDrawerState);
    const auth = useRecoilValue(authState)
    const nav= useNavigate()

    // React Query를 사용하여 채팅 리스트 가져오기
    const { data: list = [], isLoading, error } = useQuery(
        ['chattingList'],
        () => getChattingList(),
        {
            enabled: !!auth && drawerVisible,
        }
    );

    if (isLoading) {
        return <LoadingSpinner />;
    }

    if (error) {
        nav('/login')
        return <p>Error fetching chatting list!</p>;
    }

    return (
        <div className="flex flex-col w-full h-full justify-between">
            <div className="min-h-[70px] basis-[70px] flex justify-center items-center px-[20px]">
                <button className="w-10 h-10 basis-10 invisible"></button>
                <h2 className="flex flex-col md:flex-row justify-center items-center md:space-x-2 flex-1 text-lg font-semibold text-center text-jnGray-900">
                    <p className="mb-0">
                        <span className="flex items-center justify-center space-x-2">
                            <span>채팅</span>
                        </span>
                    </p>
                </h2>
                <div>
                    <button onClick={() => setDrawerVisible(false)}>
                        <svg
                            stroke="currentColor"
                            fill="currentColor"
                            strokeWidth="0"
                            viewBox="0 0 512 512"
                            className="w-8 h-8"
                            height="1em"
                            width="1em"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path d="M289.94 256l95-95A24 24 0 00351 127l-95 95-95-95a24 24 0 00-34 34l95 95-95 95a24 24 0 1034 34l95-95 95 95a24 24 0 0034-34z"></path>
                        </svg>
                    </button>
                </div>
            </div>
            <div className="h-full overflow-auto">
                <div className="flex flex-col h-full">
                    <div className="flex justify-between items-center w-full h-[100px] bg-jnblack text-white px-[36px] py-[16px]">
                        <h2 className="headline-semibold-18">
                           중고와 경매 구매 할 때  <br /> MINE의 안전하고 편리한 채팅 이용하세요
                        </h2>
                    </div>
                    <ul className="flex flex-col h-full overflow-auto bg-white overscroll-contain">
                        {list.map((chat) => (

                            <ChattingListComponent key={chat.roomId} chat={chat} />
                        ))}
                        <div className="min-h-[5px]"></div>
                    </ul>
                </div>
            </div>
        </div>
    );
};

const ChattingListComponent = ({ chat }) => {
    const setChatContainerState = useSetRecoilState(chatListAndRoomState);
    const setDrawerVisible = useSetRecoilState(chatDrawerState);
    const setRoomData = useSetRecoilState(chattingRoomSeller);
    const [auth, setAuth] = useRecoilState(authState)
    const [message, setMessage] = useRecoilState(textMessageArray);
    const nav = useNavigate()
    const fetchMessage = async () => {
        try {
            // 1. 서버에서 메시지 요청
            const message = await getMessage({
                roomId : chat.roomId,
                sellerId : chat.sellerId,
                buyerId : chat.buyerId,
                itemId : chat.itemId,
                itemType : chat.itemType,
                sender : chat.sender,
                receive : chat.receiver,
            });
            // // 2. 메시지 가공
            const processedMessage = processMessages(message.chat, chat.sender);
            await setRoomData({
                roomId : message.roomId,
                itemId : chat.itemId,
                nickName : message.roomData.receiveNickName,
                itemName : message.roomData.itemName,
                itemPrice : message.roomData.itemPrice,
                sender : message.roomData.sender,
                receive : message.roomData.receive,
                trust : message.roomData.receiveTrustScore
            })

            // // 3. Recoil 상태 업데이트
            setMessage(processedMessage);
        } catch (error) {
            console.error('ERROR : ', error);
        }
    };


    const chatListStyle = {
        position: 'absolute',
        height: '100%',
        width: '100%',
        inset: '0px',
        color: 'transparent',
    };

    const chatListImgStyle = {
        color: 'transparent',
    };

    return (
        <li
            className="flex justify-between px-5 gap-5 w-full cursor-pointer bg-white"
            onClick={async () => {
                    const res = await sessionCheck()
                    if(res.data) {
                        await fetchMessage()
                        setChatContainerState("roomContainer")
                    } else {
                        setAuth({isLoggedIn: false, userEmail: ''})
                        setDrawerVisible(false)
                        nav('/login')
                    }
            }}
        >
            <div className="flex py-3 border-t-[1px] border-gray-200 w-[80%]">
                <div className="border border-gray-100 relative flex flex-shrink-0 items-center justify-center bg-gray-300 rounded-full overflow-hidden">
                        <img
                            alt="프로필"
                            src="https://img2.joongna.com/media/original/2024/01/24/1706051485437Hth_JJbme.jpg"
                            width="60"
                            height="60"
                            decoding="async"
                            data-nimg="1"
                            className="rounded-full max-w-none h-[60px] object-cover"
                            loading="lazy"
                            style={chatListImgStyle}
                        />
                </div>
                <div className="flex w-[calc(100%-56px)] flex-col justify-around ml-4">
                    <div className="flex gap-2">
                        <div className="flex gap-2">
                            <h4 className="font-semibold">{chat.itemName} ({chat.receiver === chat.sellerId ? chat.sellerNickname : chat.buyerNickname})</h4>
                        </div>
                        <p className="text-[12px] mt-[2px]">{chat.lastMessageTime && new Date(chat.lastMessageTime).toLocaleDateString()}</p>
                    </div>
                    <span className="text-sm text-ellipsis overflow-hidden whitespace-nowrap min-[1024px]:max-w-[300px]">
                        {chat.lastMessage}
                    </span>
                </div>
            </div>
            <div className="my-auto">
                <div className="relative w-10 h-10">
                        <img
                            alt="채팅방 상품 썸네일 이미지"
                            src="https://img2.joongna.com/media/original/2024/01/23/1705980294921pYs_jvdmL.jpg?impolicy=thumb"
                            decoding="async"
                            data-nimg="fill"
                            className="rounded-md"
                            loading="lazy"
                            style={chatListStyle}
                        />
                </div>
            </div>
        </li>
    );
};

export default ChattingListContainer;