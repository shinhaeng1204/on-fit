/* 모집 상태 */
import {Profile} from "@/types/profilemodal";

export interface RecruitStatusProps {
  type: string,
  text: string,
  className?: string, // 추가 스타일
}

/* 실력 */
export type BadgeType = "브론즈" | "실버" | "골드" | "플레티넘";

export interface BadgeProps {
  type: BadgeType;
  className?: string;
}

/* 운동 종류 */
export interface postType {
  id: string,
  key? : string,
  title : string,
  sport : string,
  status : string,
  description? : string,
  location : string,
  profile? : Profile,
  date_time? : string,
  date: string,
  time: string,
  max_participants : number,
  current_participants : number,
  level : BadgeType,
  requirement?: string,
  fee? : string,
  room_id?: string,
  latitude: number | null,
  longitude: number | null,
  region_label: string | null,
}
