import React from "react";
import { useToggle } from "../../../hooks/useToggle";
import useFormattedPrice from "../../../hooks/useFormattedPrice";
import useRemainTime from "../../../hooks/useRemainTime";
import SellerInfo from "../../components/Common/SellerInfo";
import PaymentButtonComponent from "../../components/Auction/PaymentButtonComponent";
import {
  formatDateToTime,
  formatDateToYMD,
} from "../../../services/commonService";

const ProductInfoContainer = ({
  StImg,
  auctionDetailInfo,
  openPaymentWindow,
}) => {
  const [isLike, toggleLike] = useToggle();

  const {
    category,
    auction_item_name,
    auction_item_end_time,
    auction_item_condition,
    created_at,
  } = auctionDetailInfo;
  const { user_email, user_nickname, user_trust_score } = auctionDetailInfo;

  const formattedPrice = useFormattedPrice(
    auctionDetailInfo.auction_item_highest_price
  );

  const createdAt =
    formatDateToYMD(created_at) + " " + formatDateToTime(created_at);

  return (
    <div>
      <div className="flex items-center w-full chawkbazarBreadcrumb pt-5 lg:py-2 pb-[10px]">
        <ol className="flex flex-wrap items-center w-full mt-0 lg:mt-0">
          <li className="flex-shrink-0 px-0 mt-0 text-sm break-all transition duration-200 ease-in text-body first:ps-0 last:pe-0 hover:text-heading">
            <a className="text-jnGray-500" href="/">
              {category}
            </a>
          </li>
        </ol>
      </div>
      <div>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-lg font-bold leading-6 md:text-3xl md:leading-[28.64px] text-jnblack mr-2 ">
            {auction_item_name}
          </h1>
        </div>
        <div className="flex items-center mb-2 lg:mb-6">
          <div className="font-bold md:text-[32px] mr-2 text-[26px] leading-9 md:leading-[38.19px] text-heading">
            {formattedPrice}원
          </div>
        </div>
        <AuctionMetrics
          auctionItemEndTime={auction_item_end_time}
          auctionItemCondition={auction_item_condition}
          createdAt={createdAt}
        />
        <SellerInfo
          userEmail={user_email}
          userNickname={user_nickname}
          userTrustScore={user_trust_score}
        />
        <div className="flex items-center space-s-4 pt-4 max-[479px]:fixed max-[479px]:bottom-0 max-[479px]:left-0 max-[479px]:z-20 max-[479px]:w-full max-[479px]:px-4 max-[479px]:pb-4 max-[479px]:bg-white">
          <div className="w-8 h-8">
            <label
              htmlFor=":r0:"
              className="relative cursor-pointer"
              onClick={toggleLike}
            >
              <svg
                width="32"
                height="32"
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="pointer-events-none w-8 h-8"
              >
                <path
                  d="M5.94197 17.9925L15.2564 26.334C15.3282 26.3983 15.3641 26.4305 15.3975 26.4557C15.7541 26.7249 16.2459 26.7249 16.6025 26.4557C16.6359 26.4305 16.6718 26.3983 16.7436 26.3341L26.058 17.9925C28.8244 15.5151 29.1565 11.3015 26.8124 8.42125L26.5675 8.12029C23.8495 4.78056 18.5906 5.35863 16.663 9.20902C16.3896 9.75505 15.6104 9.75505 15.337 9.20902C13.4094 5.35863 8.1505 4.78056 5.43249 8.12028L5.18755 8.42125C2.84352 11.3015 3.17564 15.5151 5.94197 17.9925Z"
                  strokeWidth="1.5"
                  stroke={isLike ? "#dc2626" : "#9CA3AF"}
                  fill={isLike ? "#dc2626" : "transparent"}
                ></path>
              </svg>
            </label>
            <input id=":r0:" type="checkbox" className="a11yHidden" />
          </div>
          <button
            data-variant="slim"
            className="text-[13px] md:text-sm leading-4 inline-flex items-center cursor-pointer transition ease-in-out duration-300 font-semibold font-body text-center justify-center placeholder-white focus-visible:outline-none focus:outline-none rounded-md h-11 md:h-12 px-5 py-2 transform-none normal-case hover:shadow-cart ga4_product_detail_bottom w-full bg-white hover:bg-white/90 text-jnblack hover:text-jnblack border-[1px] border-jnblack"
          >
            채팅하기
          </button>
          <button
            data-variant="slim"
            className="text-[13px] md:text-sm leading-4 inline-flex items-center cursor-pointer transition ease-in-out duration-300 font-semibold font-body text-center justify-center border-0 border-transparent placeholder-white focus-visible:outline-none focus:outline-none rounded-md h-11 md:h-12 px-5 text-white py-2 transform-none normal-case hover:text-white hover:shadow-cart w-full ga4_product_detail_bottom bg-jnblack hover:bg-jnblack/90"
            onClick={openPaymentWindow}
          >
            입찰하기
          </button>
        </div>
      </div>
    </div>
  );
};

const AuctionMetrics = ({
  auctionItemEndTime,
  auctionItemCondition,
  createdAt,
}) => {
  const RemainTime = useRemainTime(auctionItemEndTime);
  return (
    <ul className="box-border flex text-center border border-gray-300 rounded items-center py-4 mb-6">
      <li className="flex flex-col flex-1 basis-[25%] px-3 sm:px-4 relative after:absolute [&amp;:not(:first-child)]:after:content-[''] after:bg-gray-300 after:h-[20px] [&amp;:not(:first-child)]:after:w-[1px] after:left-0 justify-center items-center">
        <span className="text-xs font-normal text-jnGray-600 break-keep">
          물품 상태
        </span>
        <span className="block text-sm font-semibold text-jnblack mt-1">
          {auctionItemCondition}
        </span>
      </li>
      <li className="flex flex-col flex-1 basis-[25%] px-3 sm:px-4 relative after:absolute [&amp;:not(:first-child)]:after:content-[''] after:bg-gray-300 after:h-[20px] [&amp;:not(:first-child)]:after:w-[1px] after:left-0 justify-center items-center">
        <span className="text-xs font-normal text-jnGray-600 break-keep">
          입찰 횟수
        </span>
        <span className="block text-sm font-semibold text-jnblack mt-1">
          26회
        </span>
      </li>
      <li className="flex flex-col basis-[25%] px-3 sm:px-4 relative after:absolute [&amp;:not(:first-child)]:after:content-[''] after:bg-gray-300 after:h-[20px] [&amp;:not(:first-child)]:after:w-[1px] after:left-0 justify-center items-center">
        <span className="text-xs font-normal text-jnGray-600 break-keep">
          경매 시작 시간
        </span>
        <span className="block text-sm font-semibold text-jnblack mt-1">
          {createdAt}
        </span>
      </li>
      <li className="flex flex-col basis-[25%] px-3 sm:px-4 relative after:absolute [&amp;:not(:first-child)]:after:content-[''] after:bg-gray-300 after:h-[20px] [&amp;:not(:first-child)]:after:w-[1px] after:left-0 justify-center items-center">
        <span className="text-xs font-normal text-jnGray-600 break-keep">
          남은 시간
        </span>
        <span className="block text-sm font-semibold text-jnblack mt-1">
          {RemainTime ? RemainTime : "0일 0시간 00분 00초"}
        </span>
      </li>
    </ul>
  );
};

export default ProductInfoContainer;
