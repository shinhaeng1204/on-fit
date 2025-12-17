// src/app/mypage/badges.ts
import type { BadgeType } from '@/types/post';

// TrophySection / ProfileHeader 등에서 공통으로 사용하는 타입
export type MyPageBadgeItem = {
  id: string;
  name: string;
  level: BadgeType;
  description?: string;
};

/**
 * 참여 완료 횟수(count)를 기반으로
 * 마이페이지에서 사용할 "누적 트로피 목록" 생성
 *
 * - 항상 첫걸음은 포함
 * - 조건 달성 시 위에서부터 계속 추가
 */
export function getBadgesByJoinedCount(count: number): MyPageBadgeItem[] {
  const badges: MyPageBadgeItem[] = [];

  // ✅ 0회 이상: 첫걸음 (항상 표시)
  badges.push({
    id: 'first-step',
    name: '첫걸음',
    level: '첫걸음',
    description: '첫 모임을 향한 시작이에요!',
  });

  // ✅ 10회 이상
  if (count >= 10) {
    badges.push({
      id: 'beginner',
      name: '초심자',
      level: '초심자',
      description: '운동 모임에 익숙해지고 있어요.',
    });
  }

  // ✅ 50회 이상
  if (count >= 50) {
    badges.push({
      id: 'active',
      name: '활동가',
      level: '활동가',
      description: '꾸준히 운동에 참여하고 있어요.',
    });
  }

  // ✅ 100회 이상
  if (count >= 100) {
    badges.push({
      id: 'veteran',
      name: '베테랑',
      level: '베테랑',
      description: '운동 모임의 핵심 멤버예요.',
    });
  }

  // ✅ 300회 이상
  if (count >= 300) {
    badges.push({
      id: 'legend',
      name: '레전드',
      level: '레전드',
      description: '온핏의 전설적인 참여자예요.',
    });
  }

  return badges;
}

/**
 * 참여 완료 횟수(count)를 기반으로
 * "대표 트로피 레벨" 하나만 반환
 *
 * 👉 프로필 상단, 팔로워 리스트에서 사용
 */
export function getBadgeLevelByCompletedCount(count: number): BadgeType {
  if (count >= 300) return '레전드';
  if (count >= 100) return '베테랑';
  if (count >= 50) return '활동가';
  if (count >= 10) return '초심자';
  return '첫걸음';
}
