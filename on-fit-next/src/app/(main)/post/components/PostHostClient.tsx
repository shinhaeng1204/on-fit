'use client';

import { useState } from "react";
import { Profile } from "@/types/profilemodal";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/common/Button";
import ProfileModal from "@/components/profile/ProfileModal";
import { Card, CardContent, CardHeader } from "@/components/common/Card";
import ProfileImage from "@/components/common/ProfileImage";

interface PostHostClientProps {
  host: Profile;
}

export default function PostHostClient({ host }: PostHostClientProps) {
  const [open, setOpen] = useState(false);
  const [profile, setProfile] = useState<Profile|null>(host);

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
        setProfile={setProfile}
      />
    </>
  );
}
