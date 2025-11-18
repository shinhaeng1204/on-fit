'use client';

import {useEffect, useState} from 'react';
import { Card, CardContent, CardHeader } from '@/components/common/Card';
import Badge from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { UserPlus } from 'lucide-react';
import ProfileModal from '@/components/profile/ProfileModal';
import type { Profile } from '@/types/profilemodal';
import ProfileImage from "@/components/common/ProfileImage";
import {api} from "@/lib/axios";
import {useParams} from "next/navigation";

export default function PostHost() {
  const { id } = useParams();
  // 모달 열림/닫힘 상태
  const [open, setOpen] = useState(false);
  // 임시 팔로우 상태 (나중에는 Supabase로 교체)
  const [isFollowing, setIsFollowing] = useState(false);
  const [data, setData] = useState<Profile>(null)

  useEffect(() => {
    (async() => {
      try {
        const res = await api.get(`/api/posts/${id}`);
        setData(res.data.item.profiles)
      } catch (e) {
        console.error(e)
      }
    })()
  }, [])

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
              <ProfileImage profileName={data?.nickname}/>
              <div>
                <p className="font-semibold">{data?.nickname}</p>
                <div className="mt-1 flex items-center gap-2">
                  <Badge type="gold" />
                  <span className="text-xs text-muted-foreground">
                    참여 {data?.stats?.joinedCount ?? 0}회
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
        profile={data}
        isFollowing={isFollowing}
        onToggleFollow={handleToggleFollow}
      />
    </>
  );
}
