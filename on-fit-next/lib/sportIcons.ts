import {
  Dumbbell,
  Bike,
  Mountain,
  Footprints,
  Volleyball,
  Goal,
  Flame,
  BicepsFlexed,
  PersonStanding,
  DumbbellIcon,
  Fish,
  Tent,
  Waves,
  SwatchBook,
  Weight,
  Clapperboard,
  Music,
  Mic,
  Car, CircleDotDashed, CircleArrowOutUpRight, CircleEllipsis, ArrowsUpFromLine, Warehouse, Swords, CircleDot, HandFist,
} from "lucide-react";

export const sportIcons: Record<string, React.ComponentType<any>> = {
  // --- 근력/헬스 계열 ---
  "헬스": Dumbbell,
  "PT": Dumbbell,
  "크로스핏": Flame,
  "파워리프팅": Weight,
  "보디빌딩": BicepsFlexed,

  // --- 러닝/걷기 ---
  "런닝": Footprints,
  "조깅": Footprints,
  "마라톤": Footprints,
  "트레일러닝": Mountain,
  "걷기": Footprints,

  // --- 공놀이 계열 ---
  "축구": Goal,
  "풋살": Goal,
  "농구": Volleyball,
  "배구": Volleyball,
  "족구": Volleyball,
  "테니스": CircleEllipsis,
  "배드민턴": CircleArrowOutUpRight,
  "탁구": CircleDot,
  "야구": CircleDotDashed,

  // --- 라이딩/야외 ---
  "라이딩": Bike,
  "자전거": Bike,
  "로드자전거": Bike,
  "MTB": Mountain,
  "등산": Mountain,
  "하이킹": Mountain,
  "캠핑": Tent,
  "낚시": Fish,

  // --- 수상 ---
  "수영": Waves,
  "서핑": Waves,
  "패들보드": Waves,

  // --- 실내/기타 ---
  "필라테스": PersonStanding,
  "요가": PersonStanding,
  "스트레칭": PersonStanding,
  "줌바": Music,
  "방탈출": Warehouse,
  "클라이밍": Mountain,
  "복싱": HandFist,
  "킥복싱": HandFist,
  "주짓수": Swords,
  "태권도": Swords,

  // --- 취미(운동 겸용 번개에 자주 등장) ---
  "볼링": ArrowsUpFromLine,
  "노래방": Mic,
  "보드게임": SwatchBook,
  "사진": Clapperboard,
  "드라이브": Car,
};

export const DefaultSportIcon = DumbbellIcon