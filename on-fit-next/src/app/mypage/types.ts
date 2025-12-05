import type { BadgeType } from '@/types/post';

export type FollowUser = {
  id: string;
  nickname: string;
  avatarUrl: string | null;
  location: string | null;
  mainBadgeLevel: BadgeType;
};

export type MyPageStats = {
  activeCount: number;
  completedCount: number;
  followerCount: number;
  followingCount: number;
};
