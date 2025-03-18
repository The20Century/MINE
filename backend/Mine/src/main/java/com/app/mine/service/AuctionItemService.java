package com.app.mine.service;

import com.app.mine.dto.SearchDTO;
import com.app.mine.vo.AuctionItemVO;
import com.app.mine.vo.Criteria;
import com.app.mine.vo.FileVO;
import com.app.mine.vo.UserVO;

import java.util.List;
import java.util.Map;

public interface AuctionItemService {

    // 경매 등록
    public void saveAuctionItem(AuctionItemVO acAuctionItemVO, List<FileVO> fileVOList);

    // 경매 아이템 조회 (아이템 ID로 검색)
    Map<String, Object> getAuctionItemById(int id);

    // 경매 아이템 목록 조회
        //    List<AuctionItemVO> getFilteredAuctionItems(String category, Integer minPrice, Integer maxPrice, String searchQuery, String sort);
    List<AuctionItemVO> getFilteredAuctionItems(SearchDTO searchDTO);

    Map<String, Object> findSearchAuctionItem(SearchDTO searchDTO);

    Map<String, Object> getFilteredAuctionItems(SearchDTO searchDTO, Criteria criteria);
  
    // 경매 참여
    String insertAuctionJoin(int price);

    // 내 경매 아이템 목록 조회
    List<AuctionItemVO> getMyAuctionItemList(UserVO userVO);
}