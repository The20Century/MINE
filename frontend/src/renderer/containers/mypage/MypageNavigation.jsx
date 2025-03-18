import React, {useEffect, useState} from "react";
import { useNavigate } from 'react-router-dom';
import { useRecoilState,useRecoilValue } from "recoil";
import {useQuery} from "react-query";

import styled from "styled-components";

import { myProductListAtom } from "../../../recoil/atoms/productListAtom.js"
import { myAuctionListAtom } from "../../../recoil/atoms/auctionListAtom.js"
import { activeIndexAtom } from "../../../recoil/atoms/userAtom.js"

import {myProduct} from "../../../services/productApiService.js";
import {myAuctionProduct} from "../../../services/auctionApiService.js";
import {unregister} from "../../../services/userApiService.js";
import {Link} from "react-router-dom";

const MypageNavigation = ({onItemClick}) => {

    // const [myData, setMyData] = useState([]);
    const [myAuctionList, setMyAuctionList] = useState([]);
    const [myProductList, setMyProductList] = useState([]);
    const [activeIndex, setActiveIndex] = useRecoilState(activeIndexAtom);
    const navigate = useNavigate();

    const myAuctionData = useQuery({ // useQuery hook : 서버에서 데이터를 가져옴
        queryKey: "myAuctionData", // 캐싱, 식별 고유값
        queryFn: myAuctionProduct // 서버에서 데이터 가져오는 함수
    })

    const myProductData = useQuery({ // useQuery hook : 서버에서 데이터를 가져옴
        queryKey: "myProductData", // 캐싱, 식별 고유값
        queryFn: myProduct // 서버에서 데이터 가져오는 함수
    })


    const unregisterAction = useQuery({
        queryKey: "unregister",
        queryFn: () => unregister(),
        enabled: false, // 초기에는 쿼리를 자동 실행하지 않음
        onSuccess: () => {
            alert('탈퇴되셨습니다. 이용해주셔서 감사합니다.');
            navigate('/');
        },
        onError: (error) => {
            console.error("Error during login:", error);
            alert('탈퇴 도중 오류가 발생했습니다.');
        },
    });

    const handleClick = (isProduct) => {
        if (isProduct) {
            onItemClick(myProductList, isProduct);
            // setMyData(myProductList);
        } else {
            // setMyData(myAuctionList);
            onItemClick(myAuctionList, isProduct);
        }
        // console.log("myAuctionList>>>",myAuctionList);
        setActiveIndex(0);
    }

    const handleWithDraw = () => {
        let result = confirm("탈퇴하시겠습니까?"); //확인 === true 취소 === false
        
        if(result) {
          unregisterAction.refetch();
        }
    }

    useEffect(() => {
        if (myProductData) {
            setMyProductList(myProductData.data);
        }
    }, [myProductData.data]);

    useEffect(() => {
        if (myAuctionData) {
            setMyAuctionList(myAuctionData.data);
        }
    }, [myAuctionData.data]);

    // console.log("myData>>>",myData);

    return (
        <NaviContainer>
            <NaviTitle>마이 페이지</NaviTitle>
            <h3>거래</h3>
            <ul>
              <li onClick={() => handleClick(true)}>거래상품</li>
            </ul>
            <h3>경매</h3>
            <ul>
              <li onClick={() => handleClick(false)}>경매상품</li>
            </ul>
            <h3>내 정보</h3>
            <ul>
              <li>
                  <Link to="/editInfo">회원수정</Link>
              </li>
              <li onClick={handleWithDraw}>탈퇴하기</li>
            </ul>
      </NaviContainer>
    );
};

const NaviContainer = styled.div`
    display: block;
    flex: 1 1 auto;
    flex-shrink: 1;
  flex-grow: 0;
  margin-top: 72px;
  line-height: 1.75rem;
  
  & ul {
    margin-bottom: 1.5rem;
  }
  
  & li {
    width: fit-content;
    cursor: pointer;
    margin-bottom: 10px;
    color: rgba(54, 60, 69, 1);
    font-size: 0.875rem;
    line-height: 1.25rem;
  }
  
  & h3:first-of-type {
    border-top: none;
    padding-top: 0;
  }
  
  & h3 {
    margin-bottom: 0.75rem;
    font-size: 1.125rem;
    font-weight: 600;
    color: #1f2937;
    padding-top: 1.5rem;
    border-top: 1px solid #DADEE5;
  }
`;

const NaviTitle = styled.h2`
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937; /* text-jnBlack */
`;

export default MypageNavigation;
