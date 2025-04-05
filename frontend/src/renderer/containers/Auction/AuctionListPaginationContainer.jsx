import React from "react";
import Pagination from "../../components/Common/Pagination";
import { auctionListFiltersAtom } from "../../../recoil/atoms/auctionListAtom";
import { useRecoilState } from "recoil";

const AuctionListPaginationContainer = ({ pageNation }) => {
  const [filters, setFilters] = useRecoilState(auctionListFiltersAtom);

  const handlePageClick = (e) => {
    setFilters((prev) => {
      return {
        ...prev,
        page: e.selected + 1,
      };
    });
  };

  return (
    <div className="bottom-0 py-3 m-auto text-center bg-white lg:mb-2">
      {/* 페이지네이션 */}
      {pageNation.totalPages > 1 && (
        // <Pagination pageCount={pageCount} onPageChange={handlePageClick} currentPage={currentPage} />
        <Pagination
          pageCount={pageNation.totalPages}
          onPageChange={handlePageClick}
          currentPage={pageNation.currentPage - 1}
        />
      )}
    </div>
  );
};

export default AuctionListPaginationContainer;
