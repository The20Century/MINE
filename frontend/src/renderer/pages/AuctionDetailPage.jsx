import React, { useEffect, useState } from "react";
import SwipeImgComponent from "../components/Auction/SwipeImgComponent";
import ProductInfoContainer from "../containers/Auction/ProductInfoContainer";
import ProductDetailContainer from "../containers/Auction/ProductDetailContainer";
import { useQuery } from "react-query";
import { getAuctionDetail } from "../../services/auctionApiService";
import PayModal from "./modal/PayModal";
import { useNavigate, useParams } from "react-router-dom";
import { useRecoilState } from "recoil";
import { authState } from "../../recoil/atoms/loginUserAtom";
import { sessionCheck } from "../../services/sessionCheckApi";

const AuctionDetailPage = () => {
  const StImg = {
    position: "absolute",
    height: "100%",
    width: "100%",
    inset: "0px",
    color: "transparent",
  };
  const nav = useNavigate();
  const { auctionId } = useParams();
  const [auctionDetailInfo, setAuctionDetailInfo] = useState(null);
  const [payIsOpen, setPayIsOpen] = useState(false);
  const [filePaths, setFilePaths] = useState(null);
  const [auth, setAuth] = useRecoilState(authState);

  const {
    data: auctionDetail,
    error,
    isLoading,
    isError,
  } = useQuery(
    ["auctionDetailData", auctionId],
    () => getAuctionDetail(auctionId),
    {
      enabled: !!auctionId, // productId 있을 때만 호출
      onSuccess: (data) => {
        setAuctionDetailInfo(data); // 성공 시, Recoil 상태에 데이터 저장
        setFilePaths(data.file_paths);
      },
      onError: (error) => {
        console.error("데이터를 가져오는 중 오류 발생:", error);
      },
      refetchOnWindowFocus: false,
    }
  );

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await sessionCheck(); // 세션 체크
        setAuth({ ...auth, isLoggedIn: res.data });
      } catch (error) {
        console.error(error);
      }
    };
    checkSession();
  }, []);

  const openPaymentWindow = () => {
    if (auth.isLoggedIn) {
      setPayIsOpen(true);
    } else {
      return nav("/login");
    }
  };

  return (
    <div className="flex flex-col min-hscreen default-height">
      {auctionDetailInfo && (
        <main className="relative flex-grow border-b-2 default-height">
          <div className="mx-auto md:px-8 2xl:px-16 box-content max-w-[1024px] min-[1600px]:max-w-[1280px] lg:min-h-[950px] px-5 default-height">
            <div className="items-start block grid-cols-2 lg:grid gap-x-[72px] lg:pt-[72px] lg:pb-[52px] pb-9 pt-0">
              <SwipeImgComponent StImg={StImg} filePaths={filePaths} />
              <ProductInfoContainer
                StImg={StImg}
                auctionDetailInfo={auctionDetailInfo}
                openPaymentWindow={openPaymentWindow}
              />
            </div>
            <ProductDetailContainer auctionDetailInfo={auctionDetailInfo} />
          </div>
        </main>
      )}
      {payIsOpen && (
        <PayModal
          auctionId={auctionId}
          auctionDetailInfo={auctionDetailInfo}
          setPayIsOpen={setPayIsOpen}
        />
      )}
    </div>
  );
};

export default AuctionDetailPage;
