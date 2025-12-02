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

// 🔹 탭 UI + 삭제 버튼이 들어간 클라이언트 컨테이너
import ActivityTabsContainer from '@/app/mypage/components/ActivityTabsContainer';
// 🔹 ActivityTabs에서 사용하는 타입 재사용
import type { ActivityItem } from '@/app/mypage/components/ActivityTabs';

export default async function MyPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 🔥 비로그인 → 로그인 페이지로 강제 이동
  if (!user) {
    redirect('/auth?next=/mypage');
  }

  /** ===========================================
   * 1) 마이페이지 프로필 + 참여횟수 + 뱃지 계산 한 번에 가져오기
   * =========================================== */
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

  /** ===========================================
   * 2) 만든 모임 (삭제된 글은 제외)
   * =========================================== */
  const { data: createdPosts } = await supabase
    .from('posts')
    .select('id, title, date_time, status, is_deleted')
    .eq('author_id', user.id)
    .eq('is_deleted', false) // 🔹 소프트 삭제된 글은 제외
    .order('date_time', { ascending: false });

  const created: ActivityItem[] =
    createdPosts?.map((p) => ({
      id: p.id,
      title: p.title,
      date: p.date_time,
      status: p.status === '모집중' ? 'open' : 'close',
    })) ?? [];

  /** ===========================================
   * 3) 참여한 모임
   * =========================================== */
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

  /** ===========================================
   * 4) ✅ 내가 받은 리뷰 Supabase에서 가져오기
   * =========================================== */
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

      {/* ============================
          🔥 실제 참여 횟수 기반 뱃지 표시
      =============================== */}
      <Card className="p-0">
        <TrophySection
          titleIcon={<Trophy className="h-5 w-5 text-primary" />}
          badges={badges}
        />
      </Card>

      {/* 🔥 여기가 핵심: ActivityTabs 대신 ActivityTabsContainer 사용 */}
      <Card className="p-0">
        <ActivityTabsContainer
          participated={participated}
          created={created}
        />
      </Card>

      {/* ✅ mockReviews 제거하고 실제 reviews 전달 */}
      <Card className="p-0">
        <ReviewSection reviews={reviews} />
      </Card>
    </div>
  );
}
