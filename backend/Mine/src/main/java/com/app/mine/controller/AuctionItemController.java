package com.app.mine.controller;

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
    public ResponseEntity<Map<String, Object>> getAuctionItem(@PathVariable("auctionId") int id) {
        Map<String, Object> auctionItem = auctionItemService.getAuctionItemById(id);
        return ResponseEntity.ok(auctionItem);
    }

    @GetMapping
    public ResponseEntity<List<AuctionItemVO>> getFilteredAuctionItems(
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "minPrice", required = false) Long minPrice,
            @RequestParam(value = "maxPrice", required = false) Long maxPrice,
            @RequestParam(value = "searchQuery", required = false) List<String> searchQuery,
            @RequestParam(value = "sort", defaultValue = "likes") String sort) {

//        Criteria criteria = Criteria.builder().page(page).amount(amount).build();
        SearchDTO searchDTO = new SearchDTO();
        searchDTO.setCategory(category);
        searchDTO.setType(sort);
        searchDTO.setSearchQuery(searchQuery);
        searchDTO.setMinPrice(minPrice);
        searchDTO.setMaxPrice(maxPrice);


        List<AuctionItemVO> res = auctionItemService.getFilteredAuctionItems(searchDTO);

        return ResponseEntity.ok(res);
    }

    @PostMapping("getMyAuctionItemList")
    public List<AuctionItemVO> getMyAuctionItemList(HttpSession session) {
        UserVO userInfo = (UserVO)session.getAttribute("userInfo");
        return auctionItemService.getMyAuctionItemList(userInfo);
    }

    @PostMapping("auction-join")
    public ResponseEntity<String> JoinAuction(
            @RequestParam(value = "auctionId", required = true) Long auctionId,
            @RequestParam(value = "userId", required = true) Long userId,
            @RequestParam(value = "amount", required = true) Long amount) {
        try {
            // 경매 참여 처리 로직
            // auctionItemService.insertAuctionJoin();

            return ResponseEntity.ok("경매 참여 성공");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("경매 참여 실패: " + e.getMessage());
        }
    }

    

}
