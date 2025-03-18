
import React, { useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper';
import { useRecoilValue } from 'recoil';
import { tradeItemDetail } from '../../../recoil/selectors/tradeItemSelector.js';

const SwipeImgComponent = ({ StImg }) => {
    const { productInfo } = useRecoilValue(tradeItemDetail);

    const imageData = [
        {
            id: 1,
            alt: '아디다스 아디오스 아디제로--0',
            src: 'https://img2.joongna.com/cafe-article-data/live/2024/06/22/1062585033/1719019322789_000_pdAUa_main.jpg?impolicy=resizeWatermark3&amp;isSecret=false',
        },
        {
            id: 2,
            alt: '아디다스 아디오스 아디제로--1',
            src: 'https://img2.joongna.com/cafe-article-data/live/2024/06/22/1062585033/1719019322789_001_iRiu4.jpg?impolicy=resizeWatermark3&amp;isSecret=false',
        },
        {
            id: 3,
            alt: '아디다스 아디오스 아디제로--2',
            src: 'https://img2.joongna.com/cafe-article-data/live/2024/06/22/1062585033/1719019322789_002_VssNl.jpg?impolicy=resizeWatermark3&amp;isSecret=false',
        },
        {
            id: 4,
            alt: '아디다스 아디오스 아디제로--3',
            src: 'https://img2.joongna.com/cafe-article-data/live/2024/06/22/1062585033/1719019322789_003_y2XLP.jpg?impolicy=resizeWatermark3&amp;isSecret=false',
        },
        {
            id: 5,
            alt: '아디다스 아디오스 아디제로--4',
            src: 'https://img2.joongna.com/cafe-article-data/live/2024/06/22/1062585033/1719019322790_004_HPwbV.jpg?impolicy=resizeWatermark3&amp;isSecret=false',
        },
    ];

    useEffect(() => {
        console.log(productInfo.images);
    });

    return (
        <div className="carouselWrapper relative product-gallery swiperThumbnail product-gallery-slider dotsCircle">
            <Swiper
                slidesPerView={1} // 한 번에 하나의 슬라이드만 보여줌
                slidesPerGroup={1} // 한 번에 하나의 슬라이드를 넘김
                navigation={{
                    nextEl: '#product-gallery-slider-next',
                    prevEl: '#product-gallery-slider-prev',
                }} // 커스텀 화살표
                pagination={{ clickable: true }} // 페이지네이션 활성화
                modules={[Navigation, Pagination]} // Swiper 모듈 등록
                onSlideChange={() => console.log('slide change')}
                onSwiper={(swiper) => console.log(swiper)}
            >
                {productInfo.images.map((image, i) => (
                    <SwiperSlide key={i}>
                        <div className="col-span-1 transition duration-150 ease-in hover:opacity-90 min-w-[200px] min-h-[200px] w-full relative pt-[100%] dim rounded-2xl">
                            <img
                                // alt={image.alt}
                                referrerPolicy="no-referrer"
                                src={`/api/files/display?filePath=${image}`}
                                decoding="async"
                                data-nimg="fill"
                                className="object-cover lg:w-[520px] lg:h-[520px] w-[335px] h-[335px] rounded-2xl top-1/2 left-1/2"
                                style={StImg}
                            />
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>

            {/* 커스텀 화살표 버튼 */}
            <button
                className="w-7 h-7 text-black flex items-center justify-center absolute z-10 transition duration-250 transform -translate-y-1/2 top-1/2 focus:outline-none rounded-full text-sm md:text-base lg:w-9 lg:h-9 lg:text-xl xl:w-10 xl:h-10 3xl:w-12 3xl:h-12 3xl:text-2xl max-[1023px]:hidden left-4 bg-transparent shadow-transparent hover:bg-transparent hover:text-black"
                id="product-gallery-slider-prev"
                aria-label="prev-button"
            >
                <svg
                    width="26"
                    height="28"
                    viewBox="0 0 26 28"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="rotate-[0deg]"
                >
                    <g filter="url(#filter0_d_19461_8348)">
                        <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M15.8122 5.34218C16.4517 6.0669 16.3825 7.17278 15.6578 7.81224L8.645 14L15.6578 20.1878C16.3825 20.8273 16.4517 21.9331 15.8122 22.6579C15.1727 23.3826 14.0669 23.4517 13.3421 22.8122L5.26706 15.6872C4.25192 14.7914 4.25192 13.2086 5.26706 12.3129L13.3421 5.1878C14.0669 4.54835 15.1727 4.61747 15.8122 5.34218Z"
                            fill="white"
                        ></path>
                    </g>
                </svg>
            </button>
            <button
                className="w-7 h-7 text-black flex items-center justify-center absolute z-10 transition duration-250 transform -translate-y-1/2 top-1/2 focus:outline-none rounded-full text-sm md:text-base lg:w-9 lg:h-9 lg:text-xl xl:w-10 xl:h-10 3xl:w-12 3xl:h-12 3xl:text-2xl max-[1023px]:hidden right-4 bg-transparent shadow-transparent hover:bg-transparent hover:text-black"
                id="product-gallery-slider-next"
                aria-label="next-button"
            >
                <svg
                    width="26"
                    height="28"
                    viewBox="0 0 26 28"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="rotate-[180deg]"
                >
                    <g filter="url(#filter0_d_19461_8348)">
                        <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M15.8122 5.34218C16.4517 6.0669 16.3825 7.17278 15.6578 7.81224L8.645 14L15.6578 20.1878C16.3825 20.8273 16.4517 21.9331 15.8122 22.6579C15.1727 23.3826 14.0669 23.4517 13.3421 22.8122L5.26706 15.6872C4.25192 14.7914 4.25192 13.2086 5.26706 12.3129L13.3421 5.1878C14.0669 4.54835 15.1727 4.61747 15.8122 5.34218Z"
                            fill="white"
                        ></path>
                    </g>
                </svg>
            </button>
        </div>
    );
};

export default SwipeImgComponent;
