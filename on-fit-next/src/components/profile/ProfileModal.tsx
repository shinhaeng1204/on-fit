'use client';

import { X, Users } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import Badge from '@/components/common/Badge';
import type { Profile } from '@/types/profilemodal'; 

type ProfileModalProps = {
  open: boolean;
  onClose: () => void;
  profile: Profile | null;
  isFollowing: boolean;
  onToggleFollow: (profileId: string) => Promise<void> | void;
};

export default function ProfileModal({
  open,
  onClose,
  profile,
  isFollowing,
  onToggleFollow,
}: ProfileModalProps) {
  if (!open || !profile) return null;

  const handleFollowClick = () => {
    onToggleFollow(profile.id);
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
            {/* 프로필 기본 정보 */}
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 text-lg font-bold">
                {profile?.nickname.slice(0, 1)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-base font-semibold">{profile?.nickname}</p>
                  <Badge type={profile?.level} />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  참여 {profile?.stats?.joinedCount ?? 0}회 · 팔로워 {profile?.stats?.followerCount ?? 0}명
                </p>
              </div>
            </div>

            {/* 팔로워 카드 */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl border border-border/60 bg-background/40 p-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Users className="h-4 w-4" />
                  팔로워
                </div>
                <p className="mt-1 text-sm">{profile?.stats?.followerCount ?? 0}명</p>
              </div>
            </div>

            {/* 팔로우 버튼 */}
            <div className="flex justify-end pt-2">
              <Button
                variant={isFollowing ? 'outline' : 'sport'}
                size="sm"
                onClick={handleFollowClick}
              >
                {isFollowing ? '팔로우 취소' : '팔로우'}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
