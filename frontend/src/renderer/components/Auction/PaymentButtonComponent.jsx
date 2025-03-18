import React, { useState } from 'react';
import { Bootpay } from '@bootpay/client-js';
import { toast } from 'react-toastify';
import useFormattedPrice from '../../../hooks/useFormattedPrice';
import axios from 'axios';
import { paymentCompleteResponse } from '../../../services/auctionApiService';

const PaymentButtonComponent = ({ currentPrice, setPayIsOpen, amount }) => {
    const [flag, setFlag] = useState(false);

    const handlePayment = async (amount) => {
        if (currentPrice >= amount) {
            setFlag(true);
            toast('입찰 금액이 현재 경매 입찰 금액보다 같거나 낮습니다.', {
                onClose: () => setFlag(false),
            });
        } else {
            if (flag) {
                return;
            }
            try {
                setPayIsOpen(false);
                const bootpayResponse = await Bootpay.requestPayment({
                    application_id: '6690e6aff9398e22c57ef3cb',
                    price: amount,
                    order_name: '경매결제',
                    order_id: `ORDER_${Date.now()}`,
                    extra: {
                        open_type: 'iframe',
                        escrow: true,
                        browser_open_type: [
                            {
                                browser: 'instagram',
                                open_type: 'redirect',
                            },
                            {
                                browser: 'facebook',
                                open_type: 'redirect',
                            },
                            {
                                browser: 'kakaotalk',
                                open_type: 'popup',
                            },
                            {
                                browser: 'naver',
                                open_type: 'popup',
                            },
                            {
                                browser: 'mobile_safari',
                                open_type: 'popup',
                            },
                            {
                                browser: 'mobile_chrome',
                                open_type: 'iframe',
                            },
                        ],
                        redirect_url: 'URL',
                    },
                });
                switch (bootpayResponse.event) {
                    case 'issued':
                        // 가상계좌 입금 완료 처리
                        break;
                    case 'done':
                        try {
                            paymentCompleteResponse({ auctionId: 1, userId: 1, amount: 1000 });

                            const data = await paymentCompleteResponse.json();
                            if (data.success) {
                                toast(`${useFormattedPrice(response.price)} 원 결제가 완료되었습니다.`);
                            } else {
                                toast('결제 처리 중 오류가 발생했습니다.');
                            }
                        } catch (error) {
                            console.error('서버 요청 오류:', error);
                            toast('결제 처리 중 서버 요청 오류가 발생했습니다.');
                        }
                        break;
                    case 'confirm': //payload.extra.separately_confirmed = true; 일 경우 승인  전 해당 이벤트가호출됨
                        // console.log(response.receipt_id)
                        /**
                         * 1. 클라이언트 승인을 하고자 할때
                         * // validationQuantityFromServer(); //예시) 재고확인과 같은 내부 로직을 처리하기 한다.
                         */
                        const confirmedData = await Bootpay.confirm(); //결제를 승인한다
                        if (confirmedData.event === 'done') {
                            // page reloading location reload
                        }

                        /**
                         * 2. 서버 승인을 하고자 할때
                         * // requestServerConfirm(); //예시) 서버 승인을 할 수 있도록  API를 호출한다. 서버에서는 재고확인과 로직 검증 후 서버승인을 요청한다.
                         * Bootpay.destroy(); //결제창을 닫는다.
                         */
                        break;
                }
            } catch (e) {
                // 결제 진행중 오류 발생
                // e.error_code - 부트페이 오류 코드
                // e.pg_error_code - PG 오류 코드
                // e.message - 오류 내용
                console.log('e.message', e.message);
                switch (e.event) {
                    case 'cancel':
                        // 사용자가 결제창을 닫을때 호출
                        console.log('e.message', e.message);
                        //$('.fund_float').show()
                        break;
                    case 'error':
                        // 결제 승인 중 오류 발생시 호출
                        console.log('e.error_code', e.error_code);
                        //$('.fund_float').show()
                        break;
                }
            }
            setFlag(false);
        }
    };

    return (
        <button type="button" className="btn-set" onClick={() => handlePayment(amount)} disabled={flag}>
            입찰하기
        </button>
    );
};

export default PaymentButtonComponent;
