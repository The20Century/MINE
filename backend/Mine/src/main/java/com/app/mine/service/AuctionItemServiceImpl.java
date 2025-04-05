package com.app.mine.service;

import com.app.mine.dto.MyAuctionItemDTO;
import com.app.mine.dto.PageDTO;
import com.app.mine.dto.SearchDTO;
import com.app.mine.mapper.AuctionItemMapper;
import com.app.mine.mapper.FileMapper;
import com.app.mine.vo.AuctionItemVO;
import com.app.mine.vo.Criteria;
import com.app.mine.vo.FileVO;
import com.app.mine.vo.UserVO;
import kr.co.bootpay.model.request.Cancel;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

//AuctionItemServiceImpl.java
@Service
@RequiredArgsConstructor
@Slf4j
public class AuctionItemServiceImpl implements AuctionItemService {


    private final PayService payService;
    private final AuctionItemMapper auctionItemMapper;
    private final FileMapper fileMapper;

    @Override
    public void saveAuctionItem(AuctionItemVO acAuctionItemVO, List<FileVO> fileVOList) {
        auctionItemMapper.insertAuctionItem(acAuctionItemVO);

        fileVOList.forEach(fileVO -> {
            fileVO.setAuctionItemId(auctionItemMapper.selectLastAuctionItem());

            fileMapper.insertFile(fileVO);
        });
    }

    @Override
    public Map<String, Object> getAuctionItemById(int id) {
        return auctionItemMapper.findAuctionItemById(id);
    }

    @Override
    public Map<String, Object> getAuctionItemList(SearchDTO searchDTO, Integer userId, Criteria criteria) {
       int totalCount = auctionItemMapper.getAuctionItemCount(searchDTO);

       PageDTO pageDTO = new PageDTO(criteria, totalCount, searchDTO,0);
       pageDTO.setIS_SEARCH_DTO(true);
       Map<String, Object> auctionItemsMap = new HashMap<>();
        auctionItemsMap.put("pageNation", pageDTO.toPageNationMap());
        auctionItemsMap.put("items", auctionItemMapper.findAuctionItems(searchDTO, pageDTO, userId));


       return auctionItemsMap;
    }

    @Override
    public Map<String, Object> findSearchAuctionItem(SearchDTO searchDTO) {
        Map<String, Object> auctionItemMap = new HashMap<>();
        Criteria criteria = Criteria.builder().page(1).amount(10).build();
        PageDTO pageDTO = new PageDTO(criteria, 0, searchDTO,0);
        pageDTO.setIS_SEARCH_DTO(true);
        Map<String,Object> summary = auctionItemMapper.selectItemStatisticsByCondition(searchDTO);
        List<AuctionItemVO> itemList = auctionItemMapper.selectAllAuctionItem(pageDTO);
        auctionItemMap.put("summary", summary);
        auctionItemMap.put("itemList", itemList);

        return auctionItemMap;
    }

    @Override
    public Map<String, Object> getFilteredAuctionItems(SearchDTO searchDTO, Criteria criteria) {
        //총 데이터 개수
        int totalCount = auctionItemMapper.getAuctionItemCount(searchDTO);

        //페이지 정보 계산 - 현재 페이지와 개수 기준
        PageDTO pageDTO = new PageDTO(criteria, totalCount, searchDTO,0);
        pageDTO.setIS_SEARCH_DTO(true);
        Map<String, Object> recentUsedItemsMap = new HashMap<>();
        List<AuctionItemVO> items = auctionItemMapper.selectAllAuctionItem(pageDTO);
        recentUsedItemsMap.put("pageNation", pageDTO.toPageNationMap());
        recentUsedItemsMap.put("items", items);


        // 데이터 조회
        return recentUsedItemsMap;
    }

    // 경매 참여
    @Override
    @Transactional
    public String insertAuctionJoin(Integer auctionId, Integer userId, Integer amount, String receiptId) {
        try {
            int currentHighPrice = auctionItemMapper.selectAuctionHighPrice(auctionId);
            String prevRecieptId = auctionItemMapper.selectAuctionReceiptId(auctionId);
            log.info("currentHighPrice : {}" , currentHighPrice);
            log.info("prevRecieptId: {}", prevRecieptId);

            Cancel cancel = new Cancel();
            cancel.receiptId = prevRecieptId;
            if (amount > currentHighPrice) {
                auctionItemMapper.updateAuctionJoinStatus(auctionId);
                payService.cancelPayment(cancel);
                // 경매 참여 데이터를 삽입하는 부분에 price 값도 함께 넣어야 할 수 있습니다.
                int result = auctionItemMapper.insertAuctionJoin(auctionId, userId, amount, (long)301.0, receiptId);  // 이 부분에서 price를 전달해야 할 수 있습니다.

                int updateResult = auctionItemMapper.updateAuctionItemPrice(auctionId, amount);

                if (result == 0 || updateResult ==0) {
                    return "경매 참여 실패";
                }


                return "경매 참여 성공";
            }

            return "경매 참여 실패: 제시한 가격이 현재 최고 입찰가보다 같거나 낮습니다.";
        } catch (Exception e) {
            log.error("오류 발생 로그 에러", e);
//            logger.error("경매 참여 중 오류 발생", e);
            return "경매 참여 실패: 시스템 오류";
        }
    }

    @Override
    public List<Map<String, Object>> getMyAuctionItemList(UserVO userVO) {
        List<Map<String, Object>> result = new ArrayList<>();

        // 내 경매 상품
        List<MyAuctionItemDTO> myAuctionItemList = auctionItemMapper.selectMyAuctionItemList(userVO);
        Map<String, Object> myAuctionItemMap = new HashMap<>();
        myAuctionItemMap.put("type", "myAuctionItemList");
        myAuctionItemMap.put("data", myAuctionItemList);

        // 내 경매 구매 상품
        List<MyAuctionItemDTO> myAuctionJoinList = auctionItemMapper.selectMyAuctionJoinList(userVO);
        Map<String, Object> myAuctionJoinMap = new HashMap<>();
        myAuctionJoinMap.put("type", "myAuctionJoinList");
        myAuctionJoinMap.put("data", myAuctionJoinList);

        // 내 경매 찜한 상품
        List<MyAuctionItemDTO> myAuctionLikeList = auctionItemMapper.selectMyAuctionLike(userVO);
        Map<String, Object> myAuctionLikeLMap = new HashMap<>();
        myAuctionLikeLMap.put("type", "myAuctionLikeList");
        myAuctionLikeLMap.put("data", myAuctionLikeList);

        result.add(myAuctionItemMap);
        result.add(myAuctionJoinMap);
        result.add(myAuctionLikeLMap);


        return result;
    }

}