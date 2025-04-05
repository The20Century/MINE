import React from "react";
import Pagination from "../../components/Common/Pagination";
import { useRecoilState } from "recoil";
import { tradeListFiltersAtom } from "../../../recoil/atoms/tradeAtom.js";

const TradeListPaginationContainer = ({ pageNation }) => {
  const [filters, setFilters] = useRecoilState(tradeListFiltersAtom);

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

export default TradeListPaginationContainer;
