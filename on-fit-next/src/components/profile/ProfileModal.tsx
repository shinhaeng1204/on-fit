'use client';

import { X, Users } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import Badge from '@/components/common/Badge';
import type { Profile } from '@/types/profilemodal';
import { useEffect, useState } from "react";
import { sbClient } from "@/lib/supabase-client";

type ProfileModalProps = {
  open: boolean;
  onClose: () => void;
  profile: Profile | null;
  setProfile: React.Dispatch<React.SetStateAction<Profile | null>>;
};

export default function ProfileModal({
   open,
   onClose,
   profile,
   setProfile,
 }: ProfileModalProps) {

  if (!open || !profile) return null;

  const [userId, setUserId] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);

  /** 현재 로그인한 유저 ID 가져오기 */
  useEffect(() => {
    const getUser = async () => {
      const { data } = await sbClient.auth.getUser();
      setUserId(data.user?.id ?? null);
    };
    getUser();
  }, []);

  /** 초기 팔로우 상태 계산 */
  useEffect(() => {
    (async () => {
      if (!userId || !profile?.id) return;

      const { data: me } = await sbClient
        .from("profiles")
        .select("following")
        .eq("id", userId)
        .single();

      const following = (me?.following ?? []) as string[];
      setIsFollowing(following.includes(profile.id));
    })();
  }, [userId, profile?.id]);

  /** 팔로우 토글 */
  const handleToggleFollow = async () => {
    if (!userId) {
      alert("로그인이 필요합니다.");
      return;
    }

    const prev = isFollowing;
    setIsFollowing(!prev); // UI 즉시 반영

    const rpcName = prev ? "unfollow_user" : "follow_user";
    const { error } = await sbClient.rpc(rpcName, { p_target: profile.id });

    if (error) {
      console.error(error);
      setIsFollowing(prev);
      alert(prev ? "언팔로우 실패" : "팔로우 실패");
      return;
    }

    // followers 배열 업데이트 (userId 그대로 사용)
    setProfile((old) =>
      old
        ? {
          ...old,
          followers: prev
            ? (old.followers ?? []).filter((uid) => uid !== userId)
            : [...(old.followers ?? []), userId],
        }
        : old
    );

    // 알림 등록
    if (!prev) {
      const { data: actingUser } = await sbClient
        .from("profiles")
        .select("nickname")
        .eq("id", userId)
        .single();

      const actorNickname = actingUser?.nickname ?? "알 수 없음";

      await sbClient.from("notifications").insert({
        user_id: profile.id,
        actor_id: userId,
        actor_nickname: actorNickname,
        type: "follow",
        message: `${actorNickname}님이 당신을 팔로우했습니다!`,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="relative w-full max-w-md">
        <Card className="relative rounded-2xl border border-border bg-card/95 shadow-xl backdrop-blur">
          {/* 닫기 버튼 */}
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full p-1 hover:bg-muted"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="p-6 pt-8 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 text-lg font-bold">
                {profile.nickname.slice(0, 1)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-base font-semibold">{profile.nickname}</p>
                  <Badge type={profile.level ?? "브론즈"} />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  참여 {profile.stats?.joinedCount ?? 0}회 · 팔로워 {profile.followers?.length ?? 0}명
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl border border-border/60 bg-background/40 p-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Users className="h-4 w-4" />
                  팔로워
                </div>
                <p className="mt-1 text-sm">{profile.followers?.length ?? 0}명</p>
              </div>
            </div>

            {userId !== profile.id && (
              <div className="flex justify-end pt-2">
                <Button
                  variant={isFollowing ? 'outline' : 'sport'}
                  size="sm"
                  onClick={handleToggleFollow}
                >
                  {isFollowing ? '팔로우 취소' : '팔로우'}
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
