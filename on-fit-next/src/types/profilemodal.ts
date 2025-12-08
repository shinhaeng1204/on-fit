import {BadgeType} from "@/types/post";

export type ProfileStats = {
  joinedCount: number;
  followerCount: number;
};

export type Profile = {
  id: string;
  nickname: string;
  avatarUrl?: string | null;
  profile_image: string;
  level: BadgeType;
  followers?: string[];
  following?: string[];
  stats: ProfileStats;
  home_lat: number | null
  home_lng: number | null
  home_region: string | null
};
