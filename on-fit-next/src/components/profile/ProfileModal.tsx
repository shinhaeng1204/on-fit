'use client';

import { X, MapPin, Calendar, Award } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import Badge from '@/components/common/Badge';
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import {useEffect, useState} from "react";
import {sbClient} from "@/lib/supabase-client";
import {useToggleFollow} from "@/hooks/useToggleFollow";

type ProfileModalProps = {
  open: boolean;
  onClose: () => void;
  profileId: string;
};

export default function ProfileModal({
    open,
    onClose,
    profileId,
  }: ProfileModalProps) {
  if (!open || !profileId) return null;

  const [userId, setUserId] = useState<string | null>(null);

  // 로그인 유저 로드
  useEffect(() => {
    sbClient.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
  }, []);

  // 프로필 쿼리 (API로 가져온다고 가정)
  const { data } = useQuery({
    queryKey: ["profile", profileId],
    queryFn: async () => {
      const res = await api.get(`/api/profile-modal/${profileId}`)
      return res.data
    },
  });

  const toggleFollow = useToggleFollow(profileId, userId);

  const isFollowing = userId && data?.followers?.includes(userId);

  const handleToggleFollow = () => {
    toggleFollow.mutate(isFollowing!);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="relative w-full max-w-md">
        <Card className="relative max-h-[90vh] overflow-y-auto rounded-3xl border border-border bg-[#111519]/95 px-8 pb-10 pt-6 shadow-2xl backdrop-blur">

          {/* 헤더 */}
          <div className="mb-6 flex items-center justify-between">
            <p className="text-sm font-semibold text-muted-foreground">프로필</p>

            <div className="flex items-center gap-3">
              {profileId && (
                <Button
                  variant={isFollowing ? "outline" : "sport"}
                  size="sm"
                  disabled={toggleFollow.isPending}
                  onClick={handleToggleFollow}
                >
                  {toggleFollow.isPending
                    ? "처리 중..."
                    : isFollowing
                      ? "팔로우 취소"
                      : "팔로우"}
                </Button>
              )}

              <button
                type="button"
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-border/70 bg-black/40 hover:bg-white/5 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* 프로필 영역 */}
          <div className="flex items-center gap-8">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/20 text-3xl">
              {data?.profile_image ? (
                <img
                  src={data?.profile_image}
                  alt={data?.nickname}
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                data?.nickname.slice(0, 1)
              )}
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <p className="text-2xl font-semibold">{data?.nickname}</p>
                <Badge type={data?.level ?? "브론즈"} />
              </div>

              <div className="mt-2 flex gap-10 text-center">
                <div>
                  <p className="text-2xl font-semibold text-primary">
                    {data?.stats.joinedCount}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">참여</p>
                </div>
                <div>
                  <p className="text-2xl font-semibold text-primary">
                    {data?.stats.followerCount}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">팔로워</p>
                </div>
                <div>
                  <p className="text-2xl font-semibold text-primary">
                    {data?.stats.followingCount}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">팔로잉</p>
                </div>
              </div>
            </div>
          </div>

          <div className="my-6 h-px w-full bg-border/60" />

          {/* 활동 지역 */}
          <section className="mb-4 rounded-2xl border border-border/70 bg-black/20 px-5 py-4">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4 text-primary" />
                <span>활동 지역</span>
              </div>
              <p className="text-sm">{data?.location}</p>
            </div>
          </section>

          {/* 선호 종목 */}
          <section className="mb-4 rounded-2xl border border-border/70 bg-black/20 px-5 py-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 text-primary" />
              <span>선호 종목</span>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {data?.sport_preference.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  아직 선호 종목을 설정하지 않았어요.
                </p>
              ) : (
                data?.sport_preference.map((label: string) => (
                  <span
                    key={label}
                    className="rounded-full border border-border/70 bg-black/40 px-3 py-1 text-xs"
                  >
                    {label}
                  </span>
                ))
              )}
            </div>
          </section>

          {/* 획득 뱃지 */}
          <section className="rounded-2xl border border-border/70 bg-black/20 px-5 py-4">
            <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
              <Award className="h-4 w-4 text-primary" />
              <span>획득 뱃지</span>
            </div>

            {data?.badges.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                아직 획득한 뱃지가 없어요.
              </p>
            ) : (
              <ul className="divide-y divide-border/60 text-sm">
                {data?.badges.map((badge: any) => (
                  <li
                    key={badge.id}
                    className="flex items-center justify-between py-2"
                  >
                    <span>{badge.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {badge.description}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </Card>
      </div>
    </div>
  );
}
