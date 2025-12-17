export type BadgeItem = {
  id: string;
  name: string;
  description?: string;
  level?: '첫걸음' | '초심자' | '활동가' | '베테랑' | '레전드';
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
  level: '첫걸음' | '초심자' | '활동가' | '베테랑' | '레전드';
  region?: string;
  profile_image?: string;
  preferred_exercises?: string[]; // Supabase 컬럼명에 맞게
  followers?: string[];
  following?: string[];
  stats?: ProfileStats;
  badges?: BadgeItem[];
  avatar_url?: string | null;
  home_lat: number | null
  home_lng: number | null
  home_region: string | null
};
