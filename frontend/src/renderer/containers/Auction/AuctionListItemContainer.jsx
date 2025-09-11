import React from "react";
import ItemComponent from "../../components/Auction/ItemComponent";

const AuctionListItemContainer = ({
  items,
  destinationType,
  handleLikeClick,
}) => {
  console.log("items", items);
  return (
    <ul className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 min-[1600px]:grid-cols-5 gap-x-3 lg:gap-x-5 xl:gap-x-7 gap-y-3 xl:gap-y-5 2xl:gap-y-8 search-results [&amp;_div]:ps-0">
      {items.map((item, i) => (
        <ItemComponent
          key={i}
          id={item.auctionItemId}
          image={item.filePath}
          title={item.auctionItemName}
          price={item.auctionItemHighestPrice}
          endTime={item.auctionItemEndTime}
          likes={item.likeCount}
          chats={item.chats}
          bidCount={item.bidCount}
          myFavoriteAuction={item.myFavoriteAuction}
          handleLikeClick={handleLikeClick}
          destinationType={destinationType}
        />
      ))}
    </ul>
  );
};

export default AuctionListItemContainer;
