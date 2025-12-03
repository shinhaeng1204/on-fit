import { Trophy, Calendar, Users } from 'lucide-react';
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


  const { profile, badges, joinedCount } = await getMyPageData();

  const name = profile.nickname ?? '';
  const avatarUrl = profile.profile_image ?? '';
  const region = profile.location ?? '';
  const exercises = (profile.sport_preference ?? []) as string[];

  const stats = {
    participationCount: joinedCount,
    followerCount: profile.followers?.length ?? 0,
    followingCount: profile.following?.length ?? 0,
  };


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

  
  const { data: participantRows } = await supabase
    .from('participants')
    .select('room_id, joined_at')
    .eq('user_id', user.id)
    .order('joined_at', { ascending: false });

  const roomIds = participantRows?.map((row) => row.room_id) ?? [];

  let participated: ActivityItem[] = [];

  if (roomIds.length > 0) {
    const { data: joinedPosts } = await supabase
      .from('posts')
      .select('id, title, date_time, status, room_id')
      .in('room_id', roomIds);

    participated =
      joinedPosts?.map((p) => ({
        id: p.id,
        title: p.title,
        date: p.date_time,
        status: p.status === '모집중' ? 'open' : 'close',
      })) ?? [];
  }

  // 참여 수를 실제 데이터 기준으로 쓰고 싶으면 여기서 업데이트
  stats.participationCount = participated.length;

  
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
        <ActivityTabsContainer
          participated={participated}
          created={created}
        />
      </Card>

      
      <Card className="p-0">
        <ReviewSection reviews={reviews} />
      </Card>
    </div>
  );
}
