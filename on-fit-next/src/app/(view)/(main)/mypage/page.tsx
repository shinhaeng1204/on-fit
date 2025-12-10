// src/app/mypage/page.tsx
import { Trophy } from 'lucide-react';
import { Card } from '@/components/common/Card';
import ProfileHeader from '@/app/(view)/(main)/mypage/components/ProfileHeader';
import TrophySection from '@/app/(view)/(main)/mypage/components/TrophySection';
import RegionSection from '@/app/(view)/(main)/mypage/components/RegionSection';
import PreferredExercisesSection from '@/app/(view)/(main)/mypage/components/PreferredExercisesSection';
import ReviewSection from '@/app/(view)/(main)/mypage/components/ReviewSection';

import { createSupabaseServerClient } from '@/lib/route-helpers';
import { getMyPageData } from '@/app/(view)/(main)/mypage/_api/getMyPageData';
import { getMyReviews } from '@/lib/reviews';

import ActivityTabsContainer from '@/app/(view)/(main)/mypage/components/ActivityTabsContainer';
import type { ActivityItem } from '@/app/(view)/(main)/mypage/components/ActivityTabs';
import type { FollowUser, MyPageStats } from '@/app/(view)/(main)/mypage/types';
import { getBadgeLevelByCompletedCount } from '@/app/(view)/(main)/mypage/badges';

export default async function MyPage() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user!;

  // ✅ 기본 마이페이지 데이터 (프로필 + 트로피)
  const { profile, badges } = await getMyPageData();

  const name = profile.nickname ?? '';
  const avatarUrl = profile.profile_image ?? '';
  const region = profile.home_region ?? '';
  const exercises = (profile.sport_preference ?? []) as string[];

  // ===========================
  // 1) 팔로워 / 팔로잉 + 완료 횟수 → 대표 뱃지 포함 목록
  // ===========================
  const followerIds = (profile.followers ?? []) as string[];
  const followingIds = (profile.following ?? []) as string[];

  let followersList: FollowUser[] = [];
  let followingsList: FollowUser[] = [];

  const allTargetIds = Array.from(new Set([...followerIds, ...followingIds]));
  const completedCountMap = new Map<string, number>();

  if (allTargetIds.length > 0) {
    const {
      data: completedRowsForFollowUsers,
      error: completedListError,
    } = await supabase
      .from('v_user_completed_participation_count')
      .select('user_id, participation_count')
      .in('user_id', allTargetIds);

    if (completedListError) {
      console.error(
        'failed to load completed participation counts for follow users',
        completedListError,
      );
    } else {
      completedRowsForFollowUsers?.forEach((row) => {
        completedCountMap.set(row.user_id, row.participation_count ?? 0);
      });
    }
  }

  // 팔로워 프로필 목록
  if (followerIds.length > 0) {
    const { data: followersData, error: followersError } = await supabase
      .from('profiles')
      .select('id, nickname, profile_image, location')
      .in('id', followerIds);

    if (followersError) {
      console.error('failed to load followers', followersError);
    } else {
      followersList =
        followersData?.map((p) => {
          const completedCount = completedCountMap.get(p.id) ?? 0;
          const mainBadgeLevel = getBadgeLevelByCompletedCount(completedCount);

          return {
            id: p.id,
            nickname: p.nickname,
            avatarUrl: p.profile_image,
            location: p.location,
            mainBadgeLevel,
          } satisfies FollowUser;
        }) ?? [];
    }
  }

  // 팔로잉 프로필 목록
  if (followingIds.length > 0) {
    const { data: followingsData, error: followingsError } = await supabase
      .from('profiles')
      .select('id, nickname, profile_image, location')
      .in('id', followingIds);

    if (followingsError) {
      console.error('failed to load followings', followingsError);
    } else {
      followingsList =
        followingsData?.map((p) => {
          const completedCount = completedCountMap.get(p.id) ?? 0;
          const mainBadgeLevel = getBadgeLevelByCompletedCount(completedCount);

          return {
            id: p.id,
            nickname: p.nickname,
            avatarUrl: p.profile_image,
            location: p.location,
            mainBadgeLevel,
          } satisfies FollowUser;
        }) ?? [];
    }
  }

  // ===========================
  // 2) 통계 값들 (진행중 / 완료)
  // ===========================
  const { data: myCompletedRow, error: myCompletedError } = await supabase
    .from('v_user_completed_participation_count')
    .select('participation_count')
    .eq('user_id', user.id)
    .maybeSingle();

  if (myCompletedError) {
    console.error(
      'failed to load completed participation count for me',
      myCompletedError,
    );
  }

  const completedCount = myCompletedRow?.participation_count ?? 0;

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

  // ✅ 내가 참여 중인 모임
  const { data: participantRows } = await supabase
    .from('participants')
    .select('room_id, joined_at')
    .eq('user_id', user.id)
    .is('left_at', null)
    .in('role', ['participant', 'member'])
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

  const activeCount = participated.filter(
    (item) => item.status === 'open',
  ).length;

  const stats: MyPageStats = {
    activeCount,
    completedCount,
    followerCount: followersList.length,
    followingCount: followingsList.length,
  };

  // ===========================
  // 3) 리뷰
  // ===========================
  const reviews = await getMyReviews(user.id);

  // ===========================
  // 4) 렌더링 (모바일 + 데스크톱 대응)
  // ===========================
  return (
    <div className="flex flex-col gap-6">
      {/* 상단 프로필은 항상 전체 폭 사용 */}
      {/* ⭐ 수정됨: p-0과 flex justify-center 클래스를 제거했습니다. ⭐
          Card의 기본 패딩이 적용되어 좌우 여백이 생깁니다.
      */}
      <Card> 
        <ProfileHeader
          name={name}
          avatarUrl={avatarUrl}
          stats={stats}
          followers={followersList}
          followings={followingsList}
        />
      </Card>

      {/* 아래부터는 lg 이상에서 2컬럼 레이아웃 */}
      <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[2fr,3fr] lg:items-start">
        {/* 왼쪽 컬럼: 지역 + 선호운동 + 트로피 */}
        <section className="flex flex-col gap-6">
          {/* 지역 & 선호운동: md 이상에서는 2열, 모바일에서는 1열 */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* 이 Card는 여전히 p-0이 필요 없으므로 제거하고, 높이 맞춤을 위해 flex h-full flex-col 유지 */}
            <Card className="flex h-full flex-col">
              <RegionSection region={region} />
            </Card>
            <Card className="flex h-full flex-col">
              <PreferredExercisesSection exercises={exercises} />
            </Card>
          </div>

          <Card className="p-0">
            <TrophySection
              titleIcon={<Trophy className="h-5 w-5 text-primary" />}
              badges={badges}
            />
          </Card>
        </section>

        {/* 오른쪽 컬럼: 활동내역 + 받은 후기 */}
        <section className="flex flex-col gap-6">
          <Card className="p-0">
            <ActivityTabsContainer
              participated={participated}
              created={created}
            />
          </Card>

          <Card className="p-0">
            <ReviewSection reviews={reviews} />
          </Card>
        </section>
      </div>
    </div>
  );
}