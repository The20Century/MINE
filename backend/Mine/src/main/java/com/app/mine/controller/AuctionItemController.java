package com.app.mine.controller;

import com.app.mine.dto.AuctionJoinDTO;
import com.app.mine.dto.SearchDTO;
import com.app.mine.service.AuctionItemService;
import com.app.mine.service.FileService;
import com.app.mine.vo.AuctionItemVO;
import com.app.mine.vo.FileVO;
import com.app.mine.vo.UsedItemVO;
import com.app.mine.vo.Criteria;
import com.app.mine.vo.UserVO;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/auction-items/*")
@Slf4j
public class AuctionItemController {

    private final AuctionItemService auctionItemService;
    private final FileService fileService;

    @PostMapping("/save")
    public void saveUsedItem(@RequestPart("auctionItem") AuctionItemVO auctionItemVO,
                             @RequestPart(name = "files", required = false) List<MultipartFile> files, HttpSession session) throws IOException {

        UserVO userInfo = (UserVO)session.getAttribute("userInfo");
        auctionItemVO.setUserId(userInfo.getUserId());

        List<FileVO> fileVOList = new ArrayList<>();

        Map<String, Object> fileUploadResult = fileService.uploadFiles(files);

        List<String> uuids = (List<String>) fileUploadResult.get("uuids");
        List<String> filePaths = (List<String>) fileUploadResult.get("paths");

        for (int i = 0; i < files.size(); i++) {
            FileVO fileVO = new FileVO();

            fileVO.setFileUuid(uuids.get(i));
            fileVO.setFilePath(filePaths.get(i));
            fileVO.setFileName(files.get(i).getOriginalFilename());
            fileVO.setFileSize(Integer.parseInt(String.valueOf(files.get(i).getSize())));

            fileVOList.add(fileVO);
        }

        auctionItemService.saveAuctionItem(auctionItemVO, fileVOList);
    }

    @GetMapping("{auctionId}")
    public ResponseEntity<Map<String, Object>> getAuctionItemById(@PathVariable("auctionId") int id) {
        Map<String, Object> auctionItem = auctionItemService.getAuctionItemById(id);
        return ResponseEntity.ok(auctionItem);
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAuctionItemList(
            @RequestParam(value = "page", required = false) int page,
            @RequestParam(value = "amount", required = false) int amount,
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "minPrice", required = false) Long minPrice,
            @RequestParam(value = "maxPrice", required = false) Long maxPrice,
            @RequestParam(value = "searchQuery", required = false) List<String> searchQuery,
            @RequestParam(value = "sort", defaultValue = "likes") String sort,
            HttpSession session) {

        Criteria criteria = Criteria.builder().page(page).amount(amount).build();
        SearchDTO searchDTO = new SearchDTO();
        searchDTO.setCategory(category);
        searchDTO.setType(sort);
        searchDTO.setSearchQuery(searchQuery);
        searchDTO.setMinPrice(minPrice);
        searchDTO.setMaxPrice(maxPrice);

        Integer userId = null;
        UserVO userInfo = (UserVO) session.getAttribute("userInfo");
        if(userInfo != null) userInfo.getUserId();
        log.info("userId : {}",userId);

        Map<String, Object> res = auctionItemService.getAuctionItemList(searchDTO, userId, criteria);

        return ResponseEntity.ok(res);
    }

    @PostMapping("getMyAuctionItemList")
    public List<Map<String, Object>>  getMyAuctionItemList(HttpSession session) {
        UserVO userInfo = (UserVO)session.getAttribute("userInfo");
        return auctionItemService.getMyAuctionItemList(userInfo);
    }

    @PostMapping("auction-join")
    public ResponseEntity<String> JoinAuction(
            @RequestBody AuctionJoinDTO auctionJoinDTO,
            HttpSession session) {
        try {
            Integer auctionId = auctionJoinDTO.getAuctionId();
            Integer amount = auctionJoinDTO.getAmount();
            String receiptId = auctionJoinDTO.getReceiptId();
            // 경매 참여 처리 로직
            UserVO userInfo = (UserVO) session.getAttribute("userInfo");
//            Integer userId = 1;
            Integer userId = userInfo.getUserId();
            String res = auctionItemService.insertAuctionJoin(auctionId, userId, amount, receiptId);

            return ResponseEntity.ok(res);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("경매 참여 실패: " + e.getMessage());
        }
    }

    

}
