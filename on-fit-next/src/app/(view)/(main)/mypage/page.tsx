// src/app/(view)/(main)/mypage/page.tsx
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
import type {
  FollowUser,
  MyPageStats,
} from '@/app/(view)/(main)/mypage/types';
import { getBadgeLevelByCompletedCount } from '@/app/(view)/(main)/mypage/badges';
import { redirect } from 'next/navigation';
import MyPageToastWatcher from '@/app/(view)/(main)/mypage/components/MyPageToastWatcher';
import type { BadgeType } from '@/types/post';

export default async function MyPage() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  // 로그인 안 되어 있으면 로그인/온보딩 쪽으로 보내기
  if (!user) {
    redirect('/auth'); // 팀 규칙에 맞는 경로로 수정 가능
  }

  // ✅ 기본 마이페이지 데이터 (프로필)
  // getMyPageData가 badges도 리턴하더라도, 여기서는 profile만 사용
  const { profile } = await getMyPageData();

  const name = profile.nickname ?? '';
  const avatarUrl = profile.profile_image ?? '';

  // ✅ 이제부터 주소는 home_region만 사용
  const region: string = profile.home_region ?? '';

  const exercises = (profile.sport_preference ?? []) as string[];

  // 기준이 되는 현재 시각 (진행중/완료 판별용)
  const now = new Date();

  // ===========================
  // 0) 내 누적 트로피 불러오기 (v_user_trophies)
  // ===========================
  const { data: trophyRows, error: trophyError } = await supabase
    .from('v_user_trophies')
    .select('trophy_id, name, level, description')
    .eq('user_id', user.id);

  if (trophyError) {
    console.error('failed to load trophies for me', trophyError);
  }

  const badges =
    trophyRows?.map((t) => ({
      id: t.trophy_id,
      name: t.name,
      level: t.level as BadgeType, // '초심자' | '브론즈' | '실버' | '골드' | '플레티넘'
      description: t.description ?? undefined,
    })) ?? [];

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
      // ✅ home_region만 사용
      .select('id, nickname, profile_image, home_region')
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
            // FollowUser 타입의 location 필드에 home_region을 그대로 넣어서 사용
            location: p.home_region ?? null,
            mainBadgeLevel,
          } satisfies FollowUser;
        }) ?? [];
    }
  }

  // 팔로잉 프로필 목록
  if (followingIds.length > 0) {
    const { data: followingsData, error: followingsError } = await supabase
      .from('profiles')
      // ✅ home_region만 사용
      .select('id, nickname, profile_image, home_region')
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
            location: p.home_region ?? null,
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
    createdPosts?.map((p) => {
      const isCompleted =
        p.date_time ? new Date(p.date_time) < now : false;

      return {
        id: p.id,
        title: p.title,
        date: p.date_time,
        // 날짜가 지났으면 완료(close), 아니면 진행중(open)
        status: isCompleted ? 'close' : 'open',
      };
    }) ?? [];

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
      joinedPosts?.map((p) => {
        const isCompleted =
          p.date_time ? new Date(p.date_time) < now : false;

        return {
          id: p.id,
          title: p.title,
          date: p.date_time,
          status: isCompleted ? 'close' : 'open',
        };
      }) ?? [];
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
      {/* ⭐ 동네 변경 완료 시 토스트를 띄워주는 감시 컴포넌트 */}
      <MyPageToastWatcher />

      {/* 상단 프로필 */}
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
