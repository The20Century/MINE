import React from 'react';
import ReactDOM from 'react-dom/client';
import { RecoilRoot } from 'recoil';
import { QueryClient, QueryClientProvider } from 'react-query';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 0, // 재요청 하지 않는다는 설정
        },
    },
});

// 카카오맵 스크립트 동적 로드 함수
const loadKakaoMap = () => {
    const kakaoApiKey = import.meta.env.VITE_KAKAO_API_KEY; // .env에서 API 키 가져오기
    const existingScript = document.querySelector(`script[src="//dapi.kakao.com/v2/maps/sdk.js?appkey=${kakaoApiKey}&autoload=false&libraries=services"]`);

    // 중복 삽입 방지
    if (!existingScript) {
        const script = document.createElement('script');
        script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${kakaoApiKey}&autoload=false&libraries=services`;
        script.async = true;
        document.head.appendChild(script);
        script.onload = () => {
            console.log('카카오맵 스크립트가 로드되었습니다.');
        };
        script.onerror = () => {
            console.error('카카오맵 스크립트 로드에 실패했습니다.');
        };
    } else {
        console.log('카카오맵 스크립트가 이미 로드되었습니다.');
    }
};

// 스크립트 로드
loadKakaoMap();

ReactDOM.createRoot(document.getElementById('root')).render(
    <QueryClientProvider client={queryClient}>
        <RecoilRoot>
            <BrowserRouter>
                <App />
            </BrowserRouter>
        </RecoilRoot>
    </QueryClientProvider>
);