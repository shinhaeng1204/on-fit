/* 모집 상태 */
type StatusVariant = 'open' | 'close'

export interface RecruitStatusProps {
  type: StatusVariant,
  text: string,
  className?: string, // 추가 스타일
}

/* 실력 */
type BadgeVariant = 'bronze' | 'silver' | 'gold' | 'platinum'

export interface BadgeProps {
  type: BadgeVariant,
  className?: string, // 추가 스타일
}

/* 운동 종류 */
export const sportType = {
  1 : '배드민턴',
  2 : '축구',
  3 : '야구',
}

export type SportsCode = keyof typeof sportType

export interface postType {
  title : string,
  sport : SportsCode,
  status : StatusVariant,
  description : string,
  location : string,
  date_time : string,
  max_participants : number,
  current_participants : number,
  level : BadgeVariant,
  equipment: string,
  fee : string,
  room_id: string,
}