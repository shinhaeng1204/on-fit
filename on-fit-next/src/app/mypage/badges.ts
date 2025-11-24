
import type { BadgeType } from "@/types/post";

// BadgeSection 에서 쓰는 형태와 동일하게 맞춰줌
export type MyPageBadgeItem = {
  id: string;
  name: string;
  level: BadgeType;
  description?: string;
};

/**
 * 참여 횟수( joinedCount )를 받아서
 * 마이페이지에서 쓸 뱃지 리스트로 변환해주는 함수
 */
export function getBadgesByJoinedCount(count: number): MyPageBadgeItem[] {
  const badges: MyPageBadgeItem[] = [];

  if (count >= 10) {
    badges.push({
      id: "bronze",
      name: "브론즈 뱃지",
      level: "브론즈",
      description: "10회 이상 참여한 사용자예요.",
    });
  }

  if (count >= 30) {
    badges.push({
      id: "silver",
      name: "실버 뱃지",
      level: "실버",
      description: "30회 이상 참여한 사용자예요.",
    });
  }

  if (count >= 100) {
    badges.push({
      id: "gold",
      name: "골드 뱃지",
      level: "골드",
      description: "100회 이상 참여한 사용자예요.",
    });
  }

  return badges;
}
