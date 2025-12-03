import { Trophy } from 'lucide-react';
import { Card } from '@/components/common/Card';
import ProfileHeader from '@/app/mypage/components/ProfileHeader';
import TrophySection from '@/app/mypage/components/TrophySection';
import RegionSection from '@/app/mypage/components/RegionSection';
import PreferredExercisesSection from '@/app/mypage/components/PreferredExercisesSection';
import ReviewSection from '@/app/mypage/components/ReviewSection';
import { redirect } from 'next/navigation';

import { createSupabaseServerClient } from '@/lib/route-helpers';
import { getMyPageData } from '@/app/mypage/_api/getMyPageData';
import { getMyReviews } from '@/lib/reviews';

import ActivityTabsContainer from '@/app/mypage/components/ActivityTabsContainer';
import type { ActivityItem } from '@/app/mypage/components/ActivityTabs';

export default async function MyPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth?next=/mypage');
  }

  // 필요 데이터만 사용하도록 joinedCount 제거
  const { profile, badges } = await getMyPageData();

  const name = profile.nickname ?? '';
  const avatarUrl = profile.profile_image ?? '';
  const region = profile.location ?? '';
  const exercises = (profile.sport_preference ?? []) as string[];

  // ✅ 완료된 모임 수: View에서 가져오기
  const { data: completedRow, error: completedError } = await supabase
    .from('v_user_completed_participation_count') // View 이름에 맞게 사용
    .select('participation_count')
    .eq('user_id', user.id)
    .maybeSingle();

  if (completedError) {
    console.error('failed to load completed participation count', completedError);
  }

  const completedCount = completedRow?.participation_count ?? 0;

  // ✅ 내가 만든 모임
  const { data: createdPosts } = await supabase
    .from('posts')
    .select('id, title, date_time, status, is_deleted')
    .eq('author_id', user.id)
    .eq('is_deleted', false)
    .order('date_time', { ascending: false });

  const created: ActivityItem[] =
    createdPosts?.map((p) => ({
      id: p.id,
      title: p.title,
      date: p.date_time,
      status: p.status === '모집중' ? 'open' : 'close',
    })) ?? [];

  // ✅ 내가 참여 중인 모임 (나간 방은 left_at으로 제외)
  const { data: participantRows } = await supabase
    .from('participants')
    .select('room_id, joined_at')
    .eq('user_id', user.id)
    .is('left_at', null) // 나가지 않은 방만
    .order('joined_at', { ascending: false });

  const roomIds = participantRows?.map((row) => row.room_id) ?? [];

  let participated: ActivityItem[] = [];

  if (roomIds.length > 0) {
    const { data: joinedPosts, error: joinedError } = await supabase
      .from('posts')
      .select('id, title, date_time, status, room_id')
      .in('room_id', roomIds);

    if (joinedError) {
      console.error('failed to load joined posts', joinedError);
    }

    participated =
      joinedPosts?.map((p) => ({
        id: p.id,
        title: p.title,
        date: p.date_time,
        status: p.status === '모집중' ? 'open' : 'close',
      })) ?? [];
  }

  // ✅ 진행중 모임 수: 참여 중 목록에서 open 상태만 카운트
  const activeCount = participated.filter((item) => item.status === 'open').length;

  const stats = {
    activeCount,
    completedCount,
    followerCount: profile.followers?.length ?? 0,
    followingCount: profile.following?.length ?? 0,
  };

  const reviews = await getMyReviews(user.id);

  return (
    <div className="space-y-6">
      <Card className="p-0">
        <ProfileHeader name={name} avatarUrl={avatarUrl} stats={stats} />
      </Card>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card className="p-0">
          <RegionSection region={region} />
        </Card>
        <Card className="p-0">
          <PreferredExercisesSection exercises={exercises} />
        </Card>
      </div>

      <Card className="p-0">
        <TrophySection
          titleIcon={<Trophy className="h-5 w-5 text-primary" />}
          badges={badges}
        />
      </Card>

      <Card className="p-0">
        <ActivityTabsContainer participated={participated} created={created} />
      </Card>

      <Card className="p-0">
        <ReviewSection reviews={reviews} />
      </Card>
    </div>
  );
}
