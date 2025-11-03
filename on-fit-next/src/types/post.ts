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
  sports : SportsCode,
  status : StatusVariant,
  description : string,
  location : string,
  date : string,
  time : string,
  totalMember : number,
  currentMember : number,
  level : BadgeVariant,
  requirements: string,
  fee : string,
}
