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
  const {
    data
  } = await supabase.auth.getUser();

  const user = data.user!

  // ✅ 기본 마이페이지 데이터 (프로필 + 트로피)
  const { profile, badges } = await getMyPageData();

  const name = profile.nickname ?? '';
  const avatarUrl = profile.profile_image ?? '';
  const region = profile.location ?? '';
  const exercises = (profile.sport_preference ?? []) as string[];

  // ===========================
  // 1) 팔로워 / 팔로잉 + 완료 횟수 → 대표 뱃지 포함 목록
  // ===========================
  const followerIds = (profile.followers ?? []) as string[];
  const followingIds = (profile.following ?? []) as string[];

  let followersList: FollowUser[] = [];
  let followingsList: FollowUser[] = [];

  // 팔로워 + 팔로잉 전체 유저 id (중복 제거)
  const allTargetIds = Array.from(new Set([...followerIds, ...followingIds]));

  // user_id -> completedCount 맵
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

  // ✅ 내 완료된 모임 수: View에서 가져오기
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

  // ✅ 내가 참여 중인 모임 (나간 방은 left_at으로 제외)
  const { data: participantRows } = await supabase
    .from('participants')
    .select('room_id, joined_at')
    .eq('user_id', user.id)
    .is('left_at', null) // 나가지 않은 방만
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

  // ✅ 진행중 모임 수: 참여 중 목록에서 open 상태만 카운트
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

  return (
    <div className="space-y-6">
      <Card className="p-0">
        <ProfileHeader
          name={name}
          avatarUrl={avatarUrl}
          stats={stats}
          followers={followersList}
          followings={followingsList}
        />
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
