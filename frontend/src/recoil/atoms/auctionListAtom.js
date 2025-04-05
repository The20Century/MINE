import { atom } from "recoil";

export const myAuctionListAtom = atom({
  key: "myAuctionListAtom",
  default: [],
});

export const auctionListFiltersAtom = atom({
  key: "auctionFiltersAtom",
  default: {
    category: null,
    priceRange: { minPrice: undefined, maxPrice: undefined },
    searchQuery: null,
    sort: "likes",
    page: 1,
  },
});
