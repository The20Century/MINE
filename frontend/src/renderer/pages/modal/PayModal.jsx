import React, { useState } from "react";
import "../../../styles/auction/modal_pay.css";
import useFormattedPrice from "../../../hooks/useFormattedPrice";
import PaymentButtonComponent from "../../components/Auction/PaymentButtonComponent";

const PayModal = ({ auctionDetailInfo, setPayIsOpen }) => {
    const [amount, setAmount] = useState('');

    const handleDigitClick = (value) => {
        if (value === '직접입력') {
            // 추가 로직이 필요할 수 있음 (예: 포커스)
        } else {
            setAmount((prev) => (prev ? Number(prev) + value : value));
        }
    };

    return (
        <div className="modal-overlay">
            <div
                className="ngdialog-content"
                style={{
                    position: 'fixed',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <div className="modal-content">
                    <div className="inner-modal">
                        <div>
                            <strong className="tit-head">입찰하기</strong>
                        </div>
                        <div className="layer-body">
                            <div className="info-profile">
                                <div className="area-info">
                                    <strong className="tit-info">{auctionDetailInfo.auction_item_name}</strong>
                                    <div className="flex">
                                        <span className="txt-sponsor">현재 입찰 금액</span>
                                        <span className="txt-sponsor space-left">
                                            {useFormattedPrice(auctionDetailInfo.auction_item_highest_price)}원
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <form name="form" className="form-manage">
                                <fieldset>
                                    <div className="wrap-fund">
                                        <div className="box-input-num">
                                            <input
                                                type="text"
                                                inputMode="numeric"
                                                id="tfWrite"
                                                name="amount"
                                                placeholder="0"
                                                className="tf-g"
                                                value={useFormattedPrice(amount)}
                                            />
                                            <em className="txt-unit">원</em>
                                            <button className="btn-reset" type="button" onClick={() => setAmount('')}>
                                                <span className="ico-close-round"></span>
                                            </button>
                                        </div>

                                        <div className="box-digit">
                                            {[1000, 3000, 5000, 10000, 30000, 50000, 100000, '직접입력'].map(
                                                (value) => (
                                                    <button
                                                        key={value}
                                                        type="button"
                                                        className="btn-digit"
                                                        onClick={() => handleDigitClick(value)}
                                                    >
                                                        {typeof value === 'number'
                                                            ? `+ ${useFormattedPrice(value)}원`
                                                            : value}
                                                    </button>
                                                )
                                            )}
                                        </div>
                                    </div>
                                    <div className="wrap-btns">
                                        <PaymentButtonComponent
                                            currentPrice={auctionDetailInfo.auction_item_highest_price}
                                            setPayIsOpen={setPayIsOpen}
                                            amount={amount}
                                        />
                                    </div>
                                </fieldset>
                            </form>
                        </div>
                        <div className="layer-foot">
                            <button
                                type="button"
                                className="btn-close"
                                onClick={() => {
                                    setPayIsOpen(false);
                                }}
                            >
                                <span className="ico-close ir-pm">닫기</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PayModal;
