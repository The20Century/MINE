import axios from "axios";
// import api from './api';

//baseURL api.js에서 설정 -> vite config로 변경
//baseURL: 'http://localhost:8070'

export const myAuctionProduct = async () => {
  const res = await axios.post("/api/auction-items/getMyAuctionItemList");
  return res.data;
};

export const getAuctionItems = async (filters) => {
  const { category, priceRange, searchQuery, sort, page } = filters;
  const { minPrice, maxPrice } = priceRange;

  const config = filters
    ? {
        params: {
          category,
          minPrice,
          maxPrice,
          searchQuery,
          sort,
          page,
          amount: 20,
        },
      }
    : {};
  const res = await axios.get("/api/auction-items/", config);
  console.log("res.data", res.data);
  return res.data;
};

export const getAuctionDetail = async (auctionId) => {
  const res = await axios.get(`/api/auction-items/${auctionId}`);
  console.log("디테일 response", res);
  return res.data;
};

export const paymentCompleteResponse = async ({
  auctionId,
  amount,
  receiptId,
}) => {
  const res = await axios.post(
    "/api/auction-items/auction-join",
    {
      auctionId, //게시글 ID
      amount, // 결제 금액
      receiptId,
    },
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  console.log("paymentCompleteResponse response", res.data);
  return res.data;
};

export const saveAuction = async (input, filesData) => {
  const auctionItemVO = {
    auctionItemName: input.name,
    auctionItemStartPrice: input.startPrice,
    auctionItemExplain: input.explain,
    auctionItemEndTime: input.endTime,
    minBidAmount: input.price,
    auctionItemCondition: input.status,
    categoryId: input.category,
  };

  const formData = new FormData();
  formData.append(
    "auctionItem",
    new Blob([JSON.stringify(auctionItemVO)], { type: "application/json" })
  );

  // 파일 데이터에서 파일을 복구하여 FormData에 추가
  const filePromises = filesData.map((fileData) =>
    fetch(fileData.url)
      .then((response) => response.blob())
      .then((blob) => {
        // Blob을 File 객체로 변환, 파일 확장자를 사용하도록 변경
        const filename = fileData.name; // 이미 사용자가 파일 이름을 지정
        return new File([blob], filename, { type: `image/${fileData.type}` });
      })
  );

  // 모든 파일이 준비되면 FormData에 추가하고 요청을 보냄
  const files = await Promise.all(filePromises);
  files.forEach((file) => {
    formData.append("files", file);
  });

  // Axios 요청 보내기
  return axios.post("/api/auction-items/save", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};
