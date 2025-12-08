// src/app/api/profile-modal/[id]/route.ts
import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/route-helpers';
import {
  getBadgesByJoinedCount,
  getBadgeLevelByCompletedCount,
} from '@/app/(view)/(main)/mypage/badges';

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_: Request, context: Ctx) {
  const { id } = await context.params;
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const currentUserId = user?.id ?? null;

  // ❗ "undefined" 또는 빈값 차단
  if (!id || id === 'undefined') {
    console.error('[profile-modal] invalid userId:', id);
    return NextResponse.json(
      {
        error: 'invalid_id',
        message: 'Invalid profile id',
      },
      { status: 400 },
    );
  }

  // 1) 프로필 기본 정보
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select(
      `
      id,
      email,
      nickname,
      profile_image,
      location,
      sport_preference,
      followers,
      following
    `,
    )
    .eq('id', id)
    .single();

  if (profileError) {
    return NextResponse.json(
      {
        error: 'profiles_error',
        message: profileError.message,
        details: profileError.details,
        hint: profileError.hint,
      },
      { status: 500 },
    );
  }

  if (!profile) {
    return NextResponse.json(
      { error: 'not_found', message: 'Profile not found' },
      { status: 404 },
    );
  }

  // 2) 참여 횟수
  const { count: joinedCountRaw } = await supabase
    .from('participants')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', id);

  const joinedCount = joinedCountRaw ?? 0;

  // 3) 만든 모임 수
  const { count: createdCountRaw } = await supabase
    .from('posts')
    .select('*', { count: 'exact', head: true })
    .eq('host_id', id);

  const createdCount = createdCountRaw ?? 0;

  // 4) 뱃지 / 레벨 계산
  const badges = getBadgesByJoinedCount(joinedCount);
  const level = getBadgeLevelByCompletedCount(joinedCount);

  const followers = profile.followers ?? [];
  const isFollowing = currentUserId
    ? followers.includes(currentUserId)
    : false;

  // 5) 응답 데이터
  return NextResponse.json({
    id: profile.id,
    nickname: profile.nickname,
    email: profile.email,
    profile_image: profile.profile_image,
    location: profile.location,
    sport_preference: profile.sport_preference ?? [],
    followers: profile.followers ?? [],
    following: profile.following ?? [],
    level,
    badges,
    isFollowing,
    stats: {
      joinedCount,
      createdCount,
      followerCount: (profile.followers ?? []).length,
      followingCount: (profile.following ?? []).length,
    },
  });
}
