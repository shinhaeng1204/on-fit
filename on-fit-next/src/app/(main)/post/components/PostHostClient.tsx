'use client';

import { sbClient } from "@/lib/supabase-client";
import { useEffect, useState } from "react";
import { Profile } from "@/types/profilemodal";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/common/Button";
import ProfileModal from "@/components/profile/ProfileModal";
import { Card, CardContent, CardHeader } from "@/components/common/Card";
import ProfileImage from "@/components/common/ProfileImage";

interface PostHostClientProps {
  host: Profile;
  hostId: string;
}

export default function PostHostClient({ host, hostId }: PostHostClientProps) {
  const [open, setOpen] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [myId, setMyId] = useState<string | null>(null);

  const [profile, setProfile] = useState<Profile>(host); // ⭐ host → local state로 관리

  // 내 유저 ID 가져오기
  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await sbClient.auth.getUser();
      setMyId(user?.id ?? null);
    })();
  }, []);

  // 초기 팔로우 상태 계산
  useEffect(() => {
    (async () => {
      if (!myId || !hostId) return;
      const { data: me, error } = await sbClient
        .from("profiles")
        .select("following")
        .eq("id", myId)
        .single();

      if (!error) {
        const following = (me?.following ?? []) as string[];
        setIsFollowing(following.includes(hostId));
      }
    })();
  }, [myId, hostId]);

  // 팔로우 토글
  const handleToggleFollow = async (profileId: string) => {
    if (!myId) {
      alert("로그인이 필요합니다.");
      return;
    }

    const prev = isFollowing;
    setIsFollowing(!prev); // UI 즉시 변경

    const fn = prev ? "unfollow_user" : "follow_user";
    const { error } = await sbClient.rpc(fn, { p_target: profileId });

    if (error) {
      console.error(error);
      setIsFollowing(prev); // rollback
      alert(prev ? "언팔로우 실패" : "팔로우 실패");
      return;
    }

    setProfile((old) =>
      old
        ? {
          ...old,
          followers: prev
            ? (old.followers ?? []).filter((uid) => uid !== myId) // 언팔로우
            : [...(old.followers ?? []), myId], // 팔로우
        }
        : old
    );

    const { data: actorProfile } = await sbClient
      .from("profiles")
      .select("nickname")
      .eq("id", myId)
      .single();

    const actorNickname = actorProfile?.nickname ?? "알 수 없음";

    if (!prev) {
      await sbClient.from("notifications").insert({
        user_id: profileId,
        actor_id: myId,
        actor_nickname: actorNickname,
        type: "follow",
        message: `${actorNickname}님이 당신을 팔로우했습니다!`,
      });
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <h3 className="font-semibold tracking-tight text-lg">주최자 정보</h3>
        </CardHeader>

        <CardContent>
          <div className="flex items-center justify-between">
            {/* 왼쪽 (프로필 + 이름 + 배지) */}
            <button
              type="button"
              className="flex items-center gap-3 text-left"
              onClick={() => setOpen(true)}
            >
              <ProfileImage profileName={profile?.nickname} />
              <div>
                <p className="font-semibold">{profile?.nickname}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  참여 {profile?.stats?.joinedCount ?? 0}회 · 팔로워{" "}
                  {profile?.followers?.length ?? 0}명
                </p>
              </div>
            </button>

            {/* 오른쪽: 프로필 보기 버튼 */}
            <Button
              variant="sport"
              size="sm"
              leftIcon={<UserPlus className="mr-2 h-4 w-4" />}
              onClick={() => setOpen(true)}
            >
              프로필 보기
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 프로필 모달 */}
      <ProfileModal
        open={open}
        onClose={() => setOpen(false)}
        profile={profile}
        isFollowing={isFollowing}
        onToggleFollow={handleToggleFollow}
      />
    </>
  );
}
