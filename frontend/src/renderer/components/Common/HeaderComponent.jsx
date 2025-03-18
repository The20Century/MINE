/* eslint-disable react-refresh/only-export-components */
import React, { memo, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'
import logo from '../../../assets/mine.png';
import { useDropdown } from '../../../hooks/useDropdown';
import { useRecoilState } from 'recoil';
import { recentSearchesAtom } from '../../../recoil/atoms/recentSearchAtom';
import { chatDrawerState, chatListAndRoomState } from '../../../recoil/atoms/chatStateAtom';
import {authState} from '../../../recoil/atoms/loginUserAtom.js'
import {logout} from '../../../services/userApiService.js'
import {sessionCheck} from "../../../services/sessionCheckApi.js";
/**
 * 로그인 유무에 따라 마이페이지 드롭다운 설정
 */

const HeaderComponent = () => {

    useEffect(()=>{
        console.log('HeaderComponent mounted');
    },[])

    return (
        <header
            id="siteHeader"
            className="headerThree relative z-20 w-full h-16 sm:h-20 lg:h-36 xl:h-40 max-[480px]:mt-[73px] lg:mt-[60px]"
            style={{ marginTop: '0px' }}
        >
            <div
                id="header_items_wrapper"
                className="px-4 md:px-8 lg:px-0 h-16 sm:h-20 lg:h-36 xl:h-40 w-full transition duration-200 ease-in-out border-b border-jnGray-300 fixed z-20 text-gray-700 bg-white innerSticky body-font"
            >
                <div className="h-full lg:h-20 xl:h-24 px-0 lg:px-8 2xl:px-16 max-w-[1024px] min-[1600px]:max-w-[1280px] flex items-center mx-auto box-content justify-between relative before:absolute before:w-screen before:bg-[#F1F1F1] before:bottom-0">
                    <MainLogo />
                    <SearchForm />
                    <RightSideMenu />
                </div>
                <CategoryComponent />
                <div id="progress_bar" className="w-full h-[2px] absolute bottom-0 left-0"></div>
            </div>
        </header>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export default memo(HeaderComponent);



const RightSideMenu = memo(() => {
    const [, setDrawerVisible] = useRecoilState(chatDrawerState);
    const [, setChatContainerState] = useRecoilState(chatListAndRoomState)
    const { ref, isOpen, toggle, open, close }= useDropdown();
    const nav = useNavigate()
    const [auth, setAuth] = useRecoilState(authState);
    const [unreadCount, setUnreadCount] = useState(0);


    useEffect(() => {
        if(auth.isLoggedIn){
            const eventSource = new EventSource(`/chat/sse/unread-messages`);

            eventSource.onmessage = (event) => {
                const data = JSON.parse(event.data);

                setUnreadCount(data.unreadCount.count || 0); // 읽지 않은 메시지 수 업데이트
            };

            eventSource.onerror = (err) => {
                console.error('SSE error:', err);
                eventSource.close();
            };

            return () => {
                eventSource.close(); // 컴포넌트 언마운트 시 연결 종료
            };
        }
    }, [auth.isLoggedIn]);

    return (
        <>
            <div className="hidden lg:flex relative w-[355px]">
                <ul className="flex w-full text-sm font-medium list-none text-jnGray-900 break-keep">
                    <li className="flex items-center justify-center pr-3">
                        <button className="ga4_main_top_menu flex items-center justify-center"
                            onClick={async () => {
                                const res = await sessionCheck()
                                console.log(res.data)
                                if(res.data) {
                                    auth.isLoggedIn ? setDrawerVisible(true) : nav('/login')
                                    setChatContainerState("listContainer");
                                }else {
                                    setAuth({isLoggedIn: false, userEmail: ''})
                                    setDrawerVisible(false);
                                    nav('/login')
                                }
                            }}
                        >
                            <div className="relative cursor-pointer" id="채팅하기">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    fill="none"
                                    id="채팅하기"
                                    size="24"
                                >
                                    <path
                                        stroke="#141313"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="1.5"
                                        d="M20.797 12.2c0 1.639-.438 3.175-1.204 4.5l.46 3.035a.9.9 0 0 1-1.23.968l-2.526-.708a9 9 0 1 1 4.5-7.796"
                                        clipRule="evenodd"
                                    ></path>
                                    <path
                                        fill="#141313"
                                        stroke="#141313"
                                        strokeWidth="0.15"
                                        d="M8.864 12.2a1.075 1.075 0 1 0-2.15 0 1.075 1.075 0 0 0 2.15 0Zm4 0a1.075 1.075 0 1 0-2.15 0 1.075 1.075 0 0 0 2.15 0Zm4 0a1.075 1.075 0 1 0-2.15 0 1.075 1.075 0 0 0 2.15 0Z"
                                    ></path>
                                </svg>
                                <div
                                    className="absolute text-xs leading-[18px] -top-2 -right-1 w-[18px] h-[18px] font-semibold rounded-[50%] bg-jngreen text-center"
                                    id="채팅하기"
                                >
                                    {unreadCount}
                                </div>
                            </div>

                            <p id="채팅하기" className="ml-1">
                                채팅하기
                            </p>
                        </button>
                    </li>
                    <li className='after:contents-[""] after:absolute after:w-[1px] after:h-4 after:bg-jnGray-300 after:right-0 before:contents-[""] before:absolute before:w-[1px] before:h-4 before:bg-jnGray-300 before:left-0 ga4_main_top_menu relative flex items-center justify-center px-3'>
                        <Link className="flex items-center justify-center [&amp;>p]:ml-1" to="productRegister">
                            {console.log("판매하기 버튼")}
                            <svg
                                id="판매하기"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M13.6859 20.6926H4.92323C3.88605 20.6926 3.08773 19.8241 3.20716 18.8409L4.49579 8.32142C4.5775 7.63983 5.18096 7.12109 5.89756 7.12109H15.8168C16.5334 7.12109 17.1369 7.6338 17.2186 8.32142L17.91 14.0701"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                ></path>
                                <path
                                    d="M8.35938 9.35156V9.5868C8.35938 10.7751 9.47828 11.7462 10.8486 11.7462C12.219 11.7462 13.3379 10.7751 13.3379 9.5868V9.35156"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                ></path>
                                <path
                                    d="M7.35938 7.72983V6.25112C7.35938 4.34555 8.90414 2.80078 10.8097 2.80078V2.80078C12.7153 2.80078 14.26 4.34555 14.26 6.25112V7.72983"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                ></path>
                                <path
                                    d="M17.1179 22.4245C19.3694 22.4245 21.1968 20.5969 21.1968 18.347C21.1968 16.0972 19.3694 14.2695 17.1179 14.2695C14.8665 14.2695 13.0391 16.0972 13.0391 18.347C13.0391 20.5969 14.8665 22.4245 17.1179 22.4245Z"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                ></path>
                                <path
                                    d="M17.1406 19.9298V16.7461"
                                    stroke="currentColor"
                                    strokeWidth="1.2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                ></path>
                                <path
                                    d="M15.5312 18.3439H18.7149"
                                    stroke="currentColor"
                                    strokeWidth="1.2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                ></path>
                            </svg>
                            <p id="판매하기">판매</p>
                        </Link>
                    </li>
                    <li className='after:contents-[""] after:absolute after:w-[1px] after:h-4 after:bg-jnGray-300 after:right-0 before:contents-[""] before:absolute before:w-[1px] before:h-4 before:bg-jnGray-300 before:left-0 ga4_main_top_menu relative flex items-center justify-center px-3'>
                        {console.log("경매 버튼")}
                        <Link className="flex items-center justify-center [&amp;>p]:ml-1" to="auctionRegister">
                            <svg fill="#000000" height="25px" width="25px"  version="1.1" id="Layer_1"
                                 xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink"
                                 viewBox="0 0 511.996 511.996" xmlSpace="preserve"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                                <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
                                <g id="SVGRepo_iconCarrier"> <g> <g> <g> <path
                                    d="M318.866,404.713c5.653,0,11.093-2.261,15.083-6.251l120.683-120.704c4.011-3.989,6.251-9.408,6.251-15.083 c0-5.653-2.24-11.072-6.251-15.083l-60.331-60.331c-8.341-8.32-21.845-8.32-30.165,0l-15.092,15.092l-90.515-90.515 l15.082-15.082c4.011-4.011,6.251-9.429,6.251-15.083c0-5.653-2.24-11.093-6.251-15.083L213.279,6.24 c-8.341-8.32-21.845-8.32-30.165,0L62.431,126.923c-8.341,8.341-8.341,21.824,0,30.165l60.331,60.352 c4.011,3.989,9.429,6.251,15.083,6.251c5.653,0,11.093-2.261,15.083-6.251l15.094-15.094l30.171,30.171L1.347,429.361 l30.165,30.165l196.845-196.845l30.179,30.179l-15.084,15.084c-8.341,8.341-8.341,21.824,0,30.165l60.331,60.352 C307.794,402.451,313.213,404.713,318.866,404.713z M107.679,142.005l90.517-90.517l30.165,30.187L213.417,96.62 c-0.046,0.045-0.098,0.083-0.144,0.129l-42.352,42.367l-33.076,33.076L107.679,142.005z M198.19,172.183l9.088-9.095 l21.084-21.084l90.51,90.51l-15.083,15.093l-15.088,15.088L198.19,172.183z M303.683,308.045 c0.034-0.034,0.072-0.062,0.107-0.096l30.079-30.09l45.349-45.349l30.165,30.165l-90.517,90.539l-30.165-30.187L303.683,308.045z "></path>
                                    <path
                                        d="M489.315,469.329h-192c-11.776,0-21.333,9.557-21.333,21.333s9.557,21.333,21.333,21.333h192 c11.776,0,21.333-9.557,21.333-21.333S501.091,469.329,489.315,469.329z"></path>
                                    <path
                                        d="M361.315,405.329c-11.776,0-21.333,9.557-21.333,21.333s9.557,21.333,21.333,21.333h64 c11.776,0,21.333-9.557,21.333-21.333s-9.557-21.333-21.333-21.333H361.315z"></path> </g> </g> </g> </g></svg>
                            <p id="경매하기">경매</p>
                        </Link>
                    </li>
                    <li className="relative flex flex-1 pl-3"
                        ref={ref}
                    >
                        <button className="flex items-center justify-center [&amp;>p]:ml-1"
                                onClick={() => {
                                    console.log("마이페이지 버튼")
                                    auth.isLoggedIn ? open() : nav('/login')
                                }}

                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                fill="none"
                                size="24"
                            >
                                <path
                                    stroke="#141313"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="1.5"
                                    d="M16.775 7.716a3.619 3.619 0 1 1-7.238.005 3.619 3.619 0 0 1 7.238-.005M13.15 13.371c-4.026 0-7.298 3.184-7.4 7.145h14.8c-.102-3.961-3.374-7.145-7.4-7.145"
                                ></path>
                            </svg>
                            <p>마이</p>
                        </button>
                        {isOpen && (
                            <ul className="border border-jnGray-300 z-10 text-xs text-center font-medium bg-white rounded-lg absolute flex flex-col justify-center top-[30px] right-[23px] w-[100px] [&amp;>li]:mx-2 [&amp;>li]:border-b [&amp;>li]:border-jnGray-200 [&amp;>li:last-of-type]:border-b-0">
                                <li className="pt-3 pb-2 ga4_main_top_menu">
                                    <Link to="mypage">
                                        <p id="마이 페이지">마이페이지</p>
                                    </Link>
                                </li>
                                <li className="pt-2 pb-3">
                                    <button className="cursor-pointer disabled:text-stone-400"
                                            onClick={async () => {
                                                console.log("로그아웃 버튼")
                                                await logout();
                                                setAuth({isLoggedIn: false, userEmail: ''})
                                                close()
                                                nav('/')

                                            }}
                                    >로그아웃
                                    </button>
                                </li>
                            </ul>
                        )}

                    </li>
                </ul>
            </div>
        </>
    )
})

const SearchForm = memo(() => {
    // dropdown 
    const {ref, isOpen, toggle, open, close} = useDropdown();
    const [searchValue, setSearchValue] = useState('');
    const [recentSearchValues, setRecentSearchValues] = useRecoilState(recentSearchesAtom);
    const nav = useNavigate();
    const handleSubmit = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if ((recentSearchValues.indexOf(searchValue) < 0)) { // 중복 검색어 방지
                setRecentSearchValues((prev) => [...prev, searchValue])
            }
            console.log(searchValue)
            close();
            nav('/search?product=' + searchValue);
        }
    }

    const handleSearch = (e) => setSearchValue(e.target.value)

    return (
        <>
            <div ref={ref} className="relative hidden ms-7 me-7 xl:ms-9 lg:block flex-1">
                <form
                    role="search"
                    noValidate
                    className="w-full relative flex items-center h-10 overflow-hidden rounded-md bg-jnGray-200 px-3 py-[10px] lg:px-5 space-x-2"

                >
                    <label className="flex items-center py-0.5 flex-none w-4 h-4">
                        <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-[16px] h-[16px] text-[#9CA3AF]"
                        >
                            <path
                                d="M10.0278 19.0556C14.3233 19.0556 17.8056 15.5733 17.8056 11.2778C17.8056 6.98223 14.3233 3.5 10.0278 3.5C5.73223 3.5 2.25 6.98223 2.25 11.2778C2.25 15.5733 5.73223 19.0556 10.0278 19.0556Z"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                fill="transparent"
                            ></path>
                            <path
                                d="M21 21.8999L15.5 16.8999"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            ></path>
                        </svg>
                    </label>
                    <input
                        id="search-box"
                        aria-label="search-box"
                        autoComplete="off"
                        placeholder="어떤 상품을 찾으시나요?"
                        className="flex-auto text-sm text-heading bg-transparent placeholder-[#9CA3AF] overflow-hidden text-ellipsis whitespace-nowrap outline-none ga4_main_top_search"
                        name="search"
                        onClick={open}
                        ref={ref}
                        value={searchValue}
                        onChange={handleSearch}
                        onKeyDown={(e) => handleSubmit(e)}
                    />
                    {searchValue && (
                        <button type="button" className="absolute top-0 flex items-center justify-center w-12 h-full text-2xl text-gray-400 transition duration-200 ease-in-out outline-none md:text-3xl end-0 md:w-14 hover:text-heading focus:outline-none" style={{ right: '0' }}
                         onClick={() => setSearchValue('')}
                        >
                        <svg width="20px" height="20px" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" clipRule="evenodd" d="M18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10C2 5.58172 5.58172 2 10 2C14.4183 2 18 5.58172 18 10ZM7.44194 6.55806C7.19786 6.31398 6.80214 6.31398 6.55806 6.55806C6.31398 6.80214 6.31398 7.19786 6.55806 7.44194L9.11612 10L6.55806 12.5581C6.31398 12.8021 6.31398 13.1979 6.55806 13.4419C6.80214 13.686 7.19786 13.686 7.44194 13.4419L10 10.8839L12.5581 13.4419C12.8021 13.686 13.1979 13.686 13.4419 13.4419C13.686 13.1979 13.686 12.8021 13.4419 12.5581L10.8839 10L13.4419 7.44194C13.686 7.19786 13.686 6.80214 13.4419 6.55806C13.1979 6.31398 12.8021 6.31398 12.5581 6.55806L10 9.11612L7.44194 6.55806Z" fill="#9CA3AF"></path>
                        </svg>
                        </button>
                    )}
                    
                </form>
                {isOpen && (
                    <div className="bg-white flex flex-col h-[528px] w-full z-10 px-5 pt-14 absolute h-auto shadow-header"
                        style={{ paddingTop: "1.5rem",/*  height: "248px"  */}}
                    >
                        <div className="flex flex-col mb-12">
                            <div className="flex items-center justify-between">
                                <p className="text-base font-semibold text-jnGray-900">최근 검색어</p>
                                <button className="text-sm font-medium underline text-jnGray-500 decoration-solid"
                                        onClick={() => setRecentSearchValues([])}
                                >
                                    전체삭제
                                </button>
                            </div>
                            {recentSearchValues.length === 0 && (
                                <ul className="flex py-3 overflow-x-auto flex-nowrap">
                                    <li><p className="text-sm font-normal text-jnGray-500">최근 검색어 내역이 없습니다.</p></li>
                                </ul>
                            )}
                            <ul className="flex py-3 overflow-x-auto flex-nowrap recent-search">
                                {recentSearchValues.map((value, index) => {
                                    return (
                                        <li key={index}
                                            className=" flex items-center justify-center flex-shrink-0 max-w-full px-3 py-2 mr-2 text-sm capitalize truncate transition duration-200 ease-in-out border rounded-lg cursor-pointer group border-jnGray-300 text-heading hover:border-heading break-keep">
                                            <Link className="flex" to={`/search?product=${value}`} onClick={() => close()}>
                                                <p className="mx-1 text-center text-ellipsis">{value}</p>
                                            </Link>

                                            <button
                                                onClick={(e) => setRecentSearchValues(prev => prev.filter((item) => item !== value))}
                                            >
                                                <svg stroke="currentColor" fill="currentColor" strokeWidth="0"
                                                     viewBox="0 0 512 512" height="14" width="14"
                                                     xmlns="http://www.w3.org/2000/svg">
                                                    <path
                                                        d="M289.94 256l95-95A24 24 0 00351 127l-95 95-95-95a24 24 0 00-34 34l95 95-95 95a24 24 0 1034 34l95-95 95 95a24 24 0 0034-34z"></path>
                                                </svg>
                                            </button>
                                        </li>
                                    )
                                })}

                            </ul>
                        </div>
                    </div>

                )}
            </div>
        </>
    )
})
const CategoryComponent = memo(() => {
    return (
        <>
            <div className="md:px-8 2xl:px-16 lg:flex lg:h-16 items-center min-[1600px]:max-w-[1280px] max-w-[1024px] hidden headerBottom mx-auto box-content">
                <div className="relative flex-shrink-0 categoryMenu hidden lg:block">
                    <div className="flex items-center justify-center gap-2 px-3.5 xl:px-4 text-sm relative before:absolute before:-bottom-2.5 before:h-2.5 before:w-full before:z-10 font-semibold text-white transition-colors rounded-md cursor-pointer h-11 bg-heading hover:bg-black">
                        <svg
                            stroke="currentColor"
                            fill="currentColor"
                            strokeWidth="0"
                            viewBox="0 0 20 20"
                            className="text-xl"
                            height="1em"
                            width="1em"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                fillRule="evenodd"
                                d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                                clipRule="evenodd"
                            ></path>
                        </svg>
                        카테고리
                    </div>
                    <div className="absolute invisible bg-white opacity-0 subMenu shadow-header start-0 bg-heading hover:bg-black">
                        <div
                            className="grid grid-cols-5 h-full bg-gray-200 w-[630px] xl:w-[1000px] 2xl:w-[1200px] start-full "
                            style={{ boxShadow: '5px 3px 5px rgba(0, 0, 0, 0.1)' }}
                        >
                            <ul
                                className="mb-1.5 pt-6 even:bg-gray-150 pb-7 2xl:pb-8 2xl:pt-7"
                                style={{ backgroundColor: '#f6ffff' }}
                            >
                                <li className="">
                                <Link 
                                    className="block text-sm py-1.5 text-heading font-semibold px-5 xl:px-8 2xl:px-10 hover:text-heading hover:bg-gray-300" 
                                    to={{ pathname: "/search", search: "?category=101" }}
                                >
                                    디지털 기기
                                </Link>
                                </li>
                                <li className="">
                                    <Link
                                        className="block text-sm py-1.5 text-heading font-semibold px-5 xl:px-8 2xl:px-10 hover:text-heading hover:bg-gray-300"
                                        to={{ pathname: "/search", search: "?category=102" }}
                                    >
                                        생활 가전
                                    </Link>
                                </li>
                            </ul>
                            <ul
                                className="pt-6 even:bg-gray-150 pb-7 2xl:pb-8 2xl:pt-7"
                                style={{ backgroundColor: 'rgb(243 248 249)' }}
                            >
                                <li className="">
                                    <Link
                                        className="block text-sm py-1.5 text-heading font-semibold px-5 xl:px-8 2xl:px-10 hover:text-heading hover:bg-gray-300"
                                        to={{ pathname: "/search", search: "?category=103" }}
                                    >
                                        가구/인테리어
                                    </Link>
                                </li>
                                <li className="">
                                    <Link
                                        className="block text-sm py-1.5 text-heading font-semibold px-5 xl:px-8 2xl:px-10 hover:text-heading hover:bg-gray-300"
                                        to={{ pathname: "/search", search: "?category=104" }}
                                    >
                                        생활/주방
                                    </Link>
                                </li>
                            </ul>
                            <ul
                                className="pt-6 even:bg-gray-150 pb-7 2xl:pb-8 2xl:pt-7"
                                style={{ backgroundColor: '#f6ffff' }}
                            >
                                <li className="">
                                    <Link
                                        className="block text-sm py-1.5 text-heading font-semibold px-5 xl:px-8 2xl:px-10 hover:text-heading hover:bg-gray-300"
                                        to={{ pathname: "/search", search: "?category=105" }}
                                    >
                                        도서
                                    </Link>
                                </li>
                                <li className="">
                                    <Link
                                        className="block text-sm py-1.5 text-heading font-semibold px-5 xl:px-8 2xl:px-10 hover:text-heading hover:bg-gray-300"
                                        to={{ pathname: "/search", search: "?category=106" }}
                                    >
                                        의류
                                    </Link>
                                </li>
                            </ul>
                            <ul
                                className="pt-6 even:bg-gray-150 pb-7 2xl:pb-8 2xl:pt-7"
                                style={{ backgroundColor: 'rgb(243 248 249)' }}
                            >
                                <li className="">
                                    <Link
                                        className="block text-sm py-1.5 text-heading font-semibold px-5 xl:px-8 2xl:px-10 hover:text-heading hover:bg-gray-300"
                                        to={{ pathname: "/search", search: "?category=107" }}
                                    >
                                        뷰티/미용
                                    </Link>
                                </li>
                                <li className="">
                                    <Link
                                        className="block text-sm py-1.5 text-heading font-semibold px-5 xl:px-8 2xl:px-10 hover:text-heading hover:bg-gray-300"
                                        to={{ pathname: "/search", search: "?category=108" }}
                                    >
                                        스포츠/레저
                                    </Link>
                                </li>
                                <li className="">
                                    <Link
                                        className="block text-sm py-1.5 text-heading font-semibold px-5 xl:px-8 2xl:px-10 hover:text-heading hover:bg-gray-300"
                                        to={{ pathname: "/search", search: "?category=109" }}
                                    >
                                        식물
                                    </Link>
                                </li>
                            </ul>
                            <ul
                                className="pt-6 even:bg-gray-150 pb-7 2xl:pb-8 2xl:pt-7"
                                style={{ backgroundColor: '#f6ffff' }}
                            >
                                <li className="">
                                    <Link
                                        className="block text-sm py-1.5 text-heading font-semibold px-5 xl:px-8 2xl:px-10 hover:text-heading hover:bg-gray-300"
                                        to={{ pathname: "/search", search: "?category=110" }}
                                    >
                                        취미/게임/음반
                                    </Link>
                                </li>
                                <li className="">
                                    <Link
                                        className="block text-sm py-1.5 text-heading font-semibold px-5 xl:px-8 2xl:px-10 hover:text-heading hover:bg-gray-300"
                                        to={{ pathname: "/search", search: "?category=111" }}
                                    >
                                        상품권/모바일티켓
                                    </Link>
                                </li>
                                <li className="">
                                    <Link
                                        className="block text-sm py-1.5 text-heading font-semibold px-5 xl:px-8 2xl:px-10 hover:text-heading hover:bg-gray-300"
                                        to={{ pathname: "/search", search: "?category=112" }}
                                    >
                                        식품
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
                <nav className="headerMenu flex w-full relative hidden lg:flex ps-3.5 xl:ps-5 headerMenuStyle">
                    <div className="menuItem group cursor-pointer">
                        <Link
                            className="ga4_main_gnb relative inline-flex items-center px-3 py-3 text-sm font-normal xl:text-base text-heading xl:px-4 group-hover:text-black"
                            to="/product"
                        >
                            동 네 거 래
                        </Link>
                    </div>
                    <div className="menuItem group cursor-pointer">
                        <Link
                            className="ga4_main_gnb relative inline-flex items-center px-3 py-3 text-sm font-normal xl:text-base text-heading xl:px-4 group-hover:text-black"
                            to="/auction"
                        >
                            동 네 경 매
                        </Link>
                    </div>
                </nav>
            </div>
        </>
    );
});

const MainLogo = () => {
    return (
        <>
            <div className="flex flex-1 ml-3 lg:ml-0 lg:max-w-[200px]">
                <Link
                    style={{ width: '100px', height: '50px' }}
                    className="ga4_main_top_logo max-[1023px]:!w-[97px] max-[1023px]:!h-[16px] lg:w-full lg:flex-1 inline-flex focus:outline-none relative"
                    to="/"
                >
                    <span
                        style={{
                            boxSizing: 'border-box',
                            display: 'block',
                            overflow: 'hidden',
                            width: 'initial',
                            height: 'initial',
                            background: 'none',
                            opacity: 1,
                            border: 0,
                            margin: 0,
                            padding: 0,
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            bottom: 0,
                            right: 0,
                        }}
                    >
                        <img
                            alt="mine"
                            src={logo}
                            decoding="async"
                            data-nimg="fill"
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                bottom: 0,
                                right: 0,
                                boxSizing: 'border-box',
                                padding: 0,
                                border: 'none',
                                margin: 'auto',
                                display: 'block',
                                width: '0',
                                height: '0',
                                minWidth: '100%',
                                maxWidth: '100%',
                                minHeight: '100%',
                                maxHeight: '100%',
                            }}
                        />
                    </span>
                </Link>
            </div>
        </>
    )
}

