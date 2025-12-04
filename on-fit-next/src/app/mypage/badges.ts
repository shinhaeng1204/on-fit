// src/app/mypage/badges.ts
import type { BadgeType } from '@/types/post';

// BadgeSection / TrophySection 에서 쓰는 형태
export type MyPageBadgeItem = {
  id: string;
  name: string;
  level: BadgeType;
  description?: string;
};

/**
 * 참여 횟수(count)를 기반으로
 * 마이페이지에서 사용할 뱃지 리스트 생성
 */
export function getBadgesByJoinedCount(count: number): MyPageBadgeItem[] {
  const badges: MyPageBadgeItem[] = [];

  // 0회 ~ 9회 참여
  if (count < 10) {
    badges.push({
      id: 'novice',
      name: '초심자',
      level: '초심자',
      description: '아직은 시작 단계예요. 함께 성장해봐요!',
    });
  }

  if (count >= 10) {
    badges.push({
      id: 'bronze',
      name: '브론즈 트로피',
      level: '브론즈',
      description: '10회 이상 참여한 사용자예요.',
    });
  }

  if (count >= 30) {
    badges.push({
      id: 'silver',
      name: '실버 트로피',
      level: '실버',
      description: '30회 이상 참여한 사용자예요.',
    });
  }

  if (count >= 50) {
    badges.push({
      id: 'gold',
      name: '골드 트로피',
      level: '골드',
      description: '50회 이상 참여한 사용자예요.',
    });
  }

  if (count >= 80) {
    badges.push({
      id: 'platinum',
      name: '플레티넘 트로피',
      level: '플레티넘',
      description: '80회 이상 참여한 사용자예요.',
    });
  }

  return badges;
}

/**
 * 참여 완료 횟수(count)를 기반으로
 * 대표 트로피 레벨 하나만 반환하는 함수
 *
 * - 80회 이상: 플레티넘
 * - 50회 이상: 골드
 * - 30회 이상: 실버
 * - 10회 이상: 브론즈
 * - 그 미만 : 초심자
 */
export function getBadgeLevelByCompletedCount(count: number): BadgeType {
  if (count >= 80) return '플레티넘';
  if (count >= 50) return '골드';
  if (count >= 30) return '실버';
  if (count >= 10) return '브론즈';
  return '초심자';
}
