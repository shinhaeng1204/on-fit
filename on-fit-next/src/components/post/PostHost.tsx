//components/post/posthost
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
import { sbClient } from '@/lib/supabase-client';

export default function PostHost() {
  const { id } = useParams();
  // 모달 열림/닫힘 상태
  const [open, setOpen] = useState(false);
  // 임시 팔로우 상태 (나중에는 Supabase로 교체)
  const [isFollowing, setIsFollowing] = useState(false);
  const [data, setData] = useState<Profile | null>(null)

  const [myId, setMyId] = useState<string | null>(null)

  useEffect(() => {
    (async() => {
      try {
        const res = await api.get(`/api/posts/${id}`);
        setData(res.data.item.profiles)
      } catch (e) {
        console.error(e)
      }
    })()
  }, [id])

  //내 유저 정보 가져오기
  useEffect(()=>{
    (async ()=>{
      const {data:{user}} = await sbClient.auth.getUser()
      console.log(user)
      setMyId(user?.id ?? null)
    })()
  }, [])

  //초기 팔로우 상태 계산
  //내 profiles.folowing 배열에 주최자 Id가 있는지 확인
  useEffect(()=>{
    (async ()=>{
      if(!myId || !data?.id) return
      const {data:me, error} = await sbClient
        .from('profiles')
        .select('following')
        .eq('id', myId)
        .single()
      
      if(!error){
        const following = (me?.following ?? []) as string[]
        setIsFollowing(following.includes(data.id))
      }
    })()
  }, [myId, data?.id])

  const handleToggleFollow = async (profileId: string) => {
    if(!myId){
      alert("로그인이 필요합니다.")
      return
    }

    const prev = isFollowing
    setIsFollowing(!prev)

    const fn = prev ? 'unfollow_user' : 'follow_user'
    const { data, error } = await sbClient.rpc(fn, { p_target: profileId })
    const nextCount = data?.[0]?.follower_count ?? null
    if(error){
      console.error(error)
      setIsFollowing(prev)
      alert(prev ? '언팔로우에 실패했습니다.' : '팔로우에 실패했습니다.')
      return
    }
    setData(d =>
      d
        ? {
            ...d,
            followers: isFollowing
              ? (d.followers ?? []).filter(uid => uid !== myId)
              : [...(d.followers ?? []), myId],
          }
        : d
    );

    // 1) actor의 프로필 정보 가져오기
    const { data: actorProfile } = await sbClient
      .from("profiles")
      .select("nickname")
      .eq("id", myId)
      .single()

    const actorNickname = actorProfile?.nickname ?? "알 수 없음"
    console.log(actorNickname)

      // 🔥 알림 INSERT: 팔로우한 경우에만 알림 보내기
    if (!prev) {      // prev=false → 팔로우하기였던 경우
      await sbClient.from("notifications").insert({
        user_id: profileId,      // 알림 받을 사람
        actor_id: myId,          // 행동한 사람
        actor_nickname: actorNickname,   // ⭐ 추가 ⭐
        type: "follow",
        message: `${actorNickname}님이 당신을 팔로우했습니다!`
      })
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
                  <Badge type="골드" />
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
