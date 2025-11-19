import {BadgeType} from "@/types/post";

export type ProfileStats = {
  joinedCount: number;
  followerCount: number;
};

export type Profile = {
  id: string;
  nickname: string;
  avatarUrl?: string | null;
  level: BadgeType;
  followers?: string[];
  following?: string[];
  stats: ProfileStats;
};
