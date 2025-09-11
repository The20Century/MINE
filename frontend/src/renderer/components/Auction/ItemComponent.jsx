import React from "react";
import { useToggle } from "../../../hooks/useToggle";
import { Link } from "react-router-dom";
import "../../../styles/item.css";
import useFormattedPrice from "../../../hooks/useFormattedPrice";
import { authState } from "../../../recoil/atoms/loginUserAtom";
import { useRecoilState } from "recoil";
import { calculateTimeDiff } from "../../../services/commonService";

const ItemComponent = ({
  id,
  image,
  title,
  price,
  endTime,
  likes,
  chats,
  bidCount,
  myFavoriteAuction,
  handleLikeClick,
  destinationType,
}) => {
  const [auth, setAuth] = useRecoilState(authState);
  const [isLike, toggleLike] = useToggle(myFavoriteAuction);
  const StImg = {
    position: "absolute",
    height: "100%",
    width: "100%",
    inset: "0px",
    color: "transparent",
  };

  let url;

  switch (destinationType) {
    case "1":
      url = `/product/${id}`;
      break;
    case "2":
      url = `/auction/${id}`;
      break;
    default:
      url = "/";
      break;
  }

  const remainTime = calculateTimeDiff(endTime);
  // 상위에서 Props로 전달 받은 목록 (상품 이미지, 타이틀, 가격, 등록시간, 찜 수, 채팅 수) 가 포함된 데이터
  // 등록시간 기준 현재시간과 비교하여 몇 분전 계산하는 로직 필요

  return (
    <li className="">
      <div>
        <Link
          to={url}
          className="relative group box-border overflow-hidden flex rounded-md cursor-pointer pe-0 pb-2 lg:pb-3 flex-col items-start transition duration-200 ease-in-out transform bg-white"
        >
          <div className="relative w-full rounded-md overflow-hidden dim pt-[100%] mb-3 md:mb-3.5">
            <img
              alt="(정품) 프라다 버킷백"
              referrerPolicy="no-referrer"
              src={
                image
                  ? `/api/files/display?filePath=${image}`
                  : "https://img2.joongna.com/media/original/2024/08/07/17230142963766P1_R9mil.jpg?impolicy=thumb&amp;size=150"
              }
              decoding="async"
              data-nimg="fill"
              className="bg-gray-300 object-cover h-full group-hover:scale-105 w-full transition duration-200 ease-in rounded-md"
              loading="lazy"
              style={StImg}
            />
            <div
              className="absolute top-2 z-10 right-2 w-12 h-6 flex justify-around bg-gray-400 rounded-md"
              onClick={(e) => {
                e.preventDefault();
                handleLikeClick(id, toggleLike, auth.isLoggedIn);
              }}
            >
              <svg
                width="32"
                height="32"
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-6 cursor-pointer"
              >
                <path
                  d="M5.94197 17.9925L15.2564 26.334C15.3282 26.3983 15.3641 26.4305 15.3975 26.4557C15.7541 26.7249 16.2459 26.7249 16.6025 26.4557C16.6359 26.4305 16.6718 26.3983 16.7436 26.3341L26.058 17.9925C28.8244 15.5151 29.1565 11.3015 26.8124 8.42125L26.5675 8.12029C23.8495 4.78056 18.5906 5.35863 16.663 9.20902C16.3896 9.75505 15.6104 9.75505 15.337 9.20902C13.4094 5.35863 8.1505 4.78056 5.43249 8.12028L5.18755 8.42125C2.84352 11.3015 3.17564 15.5151 5.94197 17.9925Z"
                  strokeWidth="1.5"
                  stroke={isLike ? "#dc2626" : "white"}
                  fill={isLike ? "#dc2626" : "#9ca3afb4"}
                ></path>
              </svg>
              <input id=":r10:" type="checkbox" className="a11yHidden" />
              <span
                style={{
                  color: "rgb(230 230 230)",
                  fontSize: "14px",
                  alignContent: "center",
                  paddingRight: "2px",
                }}
              >
                {likes}
              </span>
            </div>
          </div>
          <div className="w-full overflow-hidden p-2 md:px-2.5 xl:px-4">
            <h2 className="line-clamp-2 min-h-[2lh] text-sm md:text-base">
              {title}
            </h2>
            <div className="font-semibold space-s-2 mt-0.5 text-heading lg:text-lg lg:mt-1.5">
              {useFormattedPrice(price)}원
            </div>
            {destinationType == 1 ? (
              <div>
                <div className="my-1 h-6 flex justify-between">
                  <span
                    className="text-sm text-gray-400"
                    style={{ alignContent: "center" }}
                  >
                    {endTime}
                  </span>
                  <div
                    className="text-xs text-gray-400 text-muted"
                    style={{ marginRight: "3px", alignContent: "center" }}
                  >
                    찜 {likes} ∙ 채팅 {chats}
                  </div>
                </div>
              </div>
            ) : (
              <div className="item-info_wrap">
                <div>
                  <span>입찰 </span>
                  <span>{bidCount}회</span>
                </div>
                <span className="bar"></span>
                <div className="item-info time">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                  >
                    <path
                      d="M13.5443 3.2199C13.7953 2.9243 13.757 2.48076 13.4591 2.23252L11.311 0.442462C11.0169 0.19744 10.5804 0.235108 10.3327 0.526876C10.0817 0.822472 10.12 1.26601 10.4179 1.51425L12.566 3.30431C12.8601 3.54933 13.2966 3.51167 13.5443 3.2199ZM3.57846 1.5113C3.87485 1.26442 3.91379 0.823528 3.66526 0.528522C3.41887 0.23606 2.98262 0.197294 2.68853 0.441729L0.541829 2.22593C0.243509 2.47388 0.204934 2.91764 0.455997 3.21334C0.703548 3.50491 1.13978 3.54259 1.43367 3.2978L3.57846 1.5113ZM7.35 4.79312C7.35 4.50317 7.11495 4.26812 6.825 4.26812C6.53505 4.26812 6.3 4.50317 6.3 4.79312V7.87071C6.3 8.22307 6.48544 8.54942 6.78814 8.72978L9.20096 10.1674C9.43606 10.3075 9.74008 10.2326 9.88328 9.99943C10.0298 9.76086 9.95196 9.44852 9.71067 9.30655L7.84289 8.20758C7.5375 8.0279 7.35 7.70003 7.35 7.3457V4.79312ZM7 1.48759C3.521 1.48759 0.7 4.28898 0.7 7.74379C0.7 11.1986 3.514 14 7 14C10.479 14 13.3 11.1986 13.3 7.74379C13.3 4.28898 10.479 1.48759 7 1.48759ZM7 12.6097C4.291 12.6097 2.1 10.434 2.1 7.74379C2.1 5.05363 4.291 2.87786 7 2.87786C9.709 2.87786 11.9 5.05363 11.9 7.74379C11.9 10.434 9.709 12.6097 7 12.6097Z"
                      fill="#626262"
                    />
                  </svg>
                  <span className="pl-[8px]">{remainTime} </span>
                </div>
              </div>
            )}
          </div>
        </Link>
      </div>
    </li>
  );
};

const AuctionLikeButton = React.memo(({ usedItemId }) => {
  const nav = useNavigate();
  const [isLike, setIsLike] = useState(false); // 초기 상태 false
  const { mutateAsync: toggleLikeMutation } = useApiMutation(
    "/api/likes/toggle",
    "post"
  );
  const { mutateAsync: toggleStateMutation } = useApiMutation(
    "/api/likes/state",
    "post"
  );
  const [likeState, setLikeState] = useState({});
  const [session, setSession] = useState(false);
  // 서버에서 현재 상태 가져오기
  useEffect(() => {
    setSession(asyncSessionCheck());
  }, []);
  useEffect(() => {
    const fetchLikeState = async () => {
      try {
        const res = await toggleStateMutation({ usedItemId });
        setLikeState(res.data); // 서버 응답 데이터 저장

        // 서버 응답에 따라 isLike 상태 설정
        if (res.data.type === "insert") {
          setIsLike(true); // isLike를 true로 설정
        } else {
          setIsLike(false); // isLike를 false로 설정
        }
      } catch (error) {
        console.error("Error fetching like state:", error);
      }
    };
    if (session) {
      fetchLikeState();
    }
  }, [toggleStateMutation, usedItemId]);

  const asyncSessionCheck = async () => {
    const res = await sessionCheck();
    return res.data;
  };
  // notify 함수
  const notify = React.useCallback(() => {
    if (likeState.result === "success") {
      if (likeState.type === "insert") {
        setIsLike(true);
        toast("찜 상품에 추가 되었습니다.");
      } else {
        setIsLike(false);
        toast("찜 상품에 해제 되었습니다.");
      }
    } else if (likeState.result === "failure") {
      toast("찜 상품 등록을 실패 하였습니다.");
    }
  }, [likeState]);

  // likeState 변경 시 notify 실행
  useEffect(() => {
    if (likeState.result) {
      notify();
    }
  }, [likeState, notify]);

  // 좋아요 상태 변경
  const handleLikeClick = async () => {
    try {
      const res = await toggleLikeMutation({ usedItemId });
      setLikeState({
        result: res.data.result,
        type: res.data.type,
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="absolute top-2 z-10 right-2 w-6 h-6">
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-6 h-6 cursor-pointer"
        onClick={async (e) => {
          e.preventDefault(); // 기본 동작 방지
          try {
            const res = await sessionCheck(); // 세션 체크
            if (res.data) {
              await handleLikeClick();
            } else {
              nav("/login"); // 로그인 페이지로 이동
            }
          } catch (error) {
            console.error(error);
          }
        }}
      >
        <path
          d="M5.94197 17.9925L15.2564 26.334C15.3282 26.3983 15.3641 26.4305 15.3975 26.4557C15.7541 26.7249 16.2459 26.7249 16.6025 26.4557C16.6359 26.4305 16.6718 26.3983 16.7436 26.3341L26.058 17.9925C28.8244 15.5151 29.1565 11.3015 26.8124 8.42125L26.5675 8.12029C23.8495 4.78056 18.5906 5.35863 16.663 9.20902C16.3896 9.75505 15.6104 9.75505 15.337 9.20902C13.4094 5.35863 8.1505 4.78056 5.43249 8.12028L5.18755 8.42125C2.84352 11.3015 3.17564 15.5151 5.94197 17.9925Z"
          strokeWidth="1.5"
          stroke={isLike ? "#dc2626" : "white"}
          fill={isLike ? "#dc2626" : "#9ca3afb4"}
        ></path>
      </svg>
      <input id=":r10:" type="checkbox" className="a11yHidden" />
    </div>
  );
});

export default ItemComponent;
