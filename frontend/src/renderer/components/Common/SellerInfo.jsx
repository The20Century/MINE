import React from 'react';

const SellerInfo = React.memo(({ userEmail, userNickname, userTrustScore }) => {
    const StProfileImg = {
        color: 'transparent',
    };

    const StWidth = {
        width: userTrustScore / 10 + '%',
    };

    return (
        <div className="w-full flex py-2">
            <div name="product-store" className="w-full ">
                <div className="flex flex-col">
                    <div>
                        <div className="flex">
                            <a className="flex items-center justify-between w-full pt-5 lg:pb-5" href="#">
                                <p className="text-[22px] font-semibold text-jnGray-900">{userNickname}</p>
                                <div className="flex items-center translate-x-4">
                                    <img
                                        width="60"
                                        height="60"
                                        className="rounded-full max-w-none h-[60px] box-content border-4 border-white -translate-x-4"
                                        loading="lazy"
                                        style={StProfileImg}
                                    />
                                </div>
                            </a>
                        </div>
                        <div>
                            <div className="flex justify-between mt-2 text-[#0CB650]">
                                <p className="text-base font-medium">
                                    신뢰지수<span className="ml-1 text-lg font-semibold">{userTrustScore}</span>
                                </p>
                                <span className="text-sm text-jnGray-500">1,000</span>
                            </div>
                            <div className="w-full h-2 bg-[#F1F4F6] rounded overflow-hidden">
                                <div className="h-full" style={StWidth}>
                                    <div className="rounded bg-gradient-to-r from-[#0DCC5A] from-0% to-[#019FB1] to-107.5% w-full h-full animate-width"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});

export default SellerInfo;
