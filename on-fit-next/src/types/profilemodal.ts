export type BadgeItem = {
  id: string;
  name: string;
  description?: string;
  level?: '초심자' | '브론즈' | '실버' | '골드' | '플레티넘';
};

export type ProfileStats = {
  joinedCount: number;
  createdCount: number;
  followerCount: number;
  followingCount: number;
};

export type Profile = {
  id: string;
  nickname: string;
  level: '초심자' | '브론즈' | '실버' | '골드' | '플레티넘';
  region?: string;
  profile_image?: string;
  preferred_exercises?: string[]; // Supabase 컬럼명에 맞게
  followers?: string[];
  following?: string[];
  stats?: ProfileStats;
  badges?: BadgeItem[];
  avatar_url?: string | null; // 있으면
};
