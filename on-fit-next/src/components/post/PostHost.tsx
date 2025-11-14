'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/common/Card';
import Badge from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { UserPlus } from 'lucide-react';
import ProfileModal from '@/components/profile/ProfileModal';
import type { Profile } from '@/types/profilemodal'; 

// TODO: 나중에 이 데이터는 API(Supabase)에서 받아오도록 변경
const hostMock = {
  id: 'host_1',
  name: '운동왕',
  participationCount: 23,
  followerCount: 0,
};

export default function PostHost() {
  // 모달 열림/닫힘 상태
  const [open, setOpen] = useState(false);
  // 임시 팔로우 상태 (나중에는 Supabase로 교체)
  const [isFollowing, setIsFollowing] = useState(false);

  // Profile 타입에 맞게 변환
  const hostProfile: Profile = {
    id: hostMock.id,
    nickname: hostMock.name,
    level: 'gold',
    avatarUrl: null,
    stats: {
      joinedCount: hostMock.participationCount,
      followerCount: hostMock.followerCount,
    },
  };

  const handleToggleFollow = async (profileId: string) => {
    // TODO: 여기서 나중에 Supabase에 팔로우 API 호출
    // ex) await supabase.from('follows').upsert({ follower_id: myId, following_id: profileId })
    setIsFollowing((prev) => !prev);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <h3 className="font-semibold tracking-tight text-lg">주최자 정보</h3>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            {/* 왼쪽: 주최자 이름/뱃지 영역 (클릭 시 모달 열기) */}
            <button
              type="button"
              className="flex items-center gap-3 text-left"
              onClick={() => setOpen(true)}
            >
              {/* TODO: 나중에 프로필 이미지 공통 컴포넌트로 교체 */}
             <span
  className="
    flex h-10 w-10 items-center justify-center rounded-full 
    bg-primary/15 text-sm font-semibold
    cursor-pointer                            /* 손가락 커서 */
    transition-transform transition-shadow transition-colors duration-200
    hover:bg-primary/30                       /* 배경 조금 더 밝게 */
    hover:shadow-[0_0_12px_rgba(34,197,94,0.6)] /* 초록빛 글로우 느낌 (원하는 색으로 수정 가능) */
   hover:opacity-80                        /* 살짝 확대 */
  "
>
  {hostProfile.nickname.slice(0, 1)}
</span>

              <div>
                <p className="font-semibold">{hostMock.name}</p>
                <div className="mt-1 flex items-center gap-2">
                  <Badge type="gold" />
                  <span className="text-xs text-muted-foreground">
                    참여 {hostMock.participationCount}회
                  </span>
                </div>
              </div>
            </button>

            {/* 오른쪽: 프로필 보기 버튼 (역할 = 모달 열기) */}
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
        profile={hostProfile}
        isFollowing={isFollowing}
        onToggleFollow={handleToggleFollow}
      />
    </>
  );
}
