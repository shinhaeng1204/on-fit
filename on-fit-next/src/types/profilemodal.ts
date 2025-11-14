// src/types/profilemodal.ts  (지금 네가 만든 파일 기준)

export type ProfileLevel = 'bronze' | 'silver' | 'gold' | 'platinum';

export type ProfileStats = {
  joinedCount: number;
  followerCount: number;
};

export type Profile = {
  id: string;
  nickname: string;
  avatarUrl?: string | null;
  level: ProfileLevel;
  stats: ProfileStats;
};
