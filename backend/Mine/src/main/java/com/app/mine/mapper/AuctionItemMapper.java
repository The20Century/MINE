package com.app.mine.mapper;

import com.app.mine.dto.MyAuctionItemDTO;
import com.app.mine.dto.PageDTO;
import com.app.mine.dto.SearchDTO;
import com.app.mine.vo.AuctionItemVO;
import com.app.mine.vo.UserVO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

@Mapper
public interface AuctionItemMapper {

    public Integer selectLastAuctionItem();

    public Map<String, Object> findAuctionItemById(int id);

//    public List<AuctionItemVO> findAuctionItems(String category,
//                                                Integer minPrice,
//                                                Integer maxPrice,
//                                                String searchQuery,
//                                                String sort,
//                                                Integer userId);

    public List<AuctionItemVO> findAuctionItems(SearchDTO searchDTO, @Param("page") PageDTO pageDTO ,Integer userId);

    public List<AuctionItemVO> selectAllAuctionItem(@Param("page") PageDTO pageDTO);

    public Map<String, Object> selectItemStatisticsByCondition(@Param("page") SearchDTO searchDTO);

    public int getAuctionItemCount(@Param("page") SearchDTO searchDTO);

    public List<MyAuctionItemDTO> selectMyAuctionItemList(UserVO userVO);

    public List<MyAuctionItemDTO> selectMyAuctionJoinList(UserVO userVO);

    public List<MyAuctionItemDTO> selectMyAuctionLike(UserVO userVO);

    public void insertAuctionItem(AuctionItemVO acAuctionItemVO);

    public int selectAuctionHighPrice(Integer auctionId); // 경매 아이템 결제 전 입찰최고금액 조회

    public String selectAuctionReceiptId(Integer auctionId);    //취소할 결제내역의 영수증 ID 조회

    public int insertAuctionJoin(Integer auctionId, Integer userId, Integer amount, Long status, String receiptId); // 경매 참여

    public int updateAuctionItemPrice(Integer auctionId, Integer amount); // 경매 참여 후 경매 입찰가 업데이트

    public int updateAuctionJoinStatus(Integer auctionId);  // 경매 참여 후 낙찰 아이템 스테이터스 변경
}
