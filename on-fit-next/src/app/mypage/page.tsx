import Link from 'next/link';
import { Trophy, Calendar, Users, LogIn } from 'lucide-react';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import ProfileHeader from '@/app/mypage/components/ProfileHeader';
import ActivityTabs from '@/app/mypage/components/ActivityTabs';
import RegionSection from '@/app/mypage/components/RegionSection';
import PreferredExercisesSection from '@/app/mypage/components/PreferredExercisesSection';

import { createSupabaseServerClient } from '@/lib/route-helpers';
import { getMyPageData } from '@/app/mypage/_api/getMyPageData';
import TrophySection from './components/TrophySection';

type ActivityItem = {
  id: string;
  title: string;
  date: string;
  status: 'open' | 'close';
};

export default async function MyPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 py-10">
        <p className="text-sm text-muted-foreground">로그인이 필요합니다.</p>

        <Link href="/auth?next=/mypage">
          <Button size="sm">
            <LogIn className="mr-2 h-4 w-4" />
            로그인 하러가기
          </Button>
        </Link>
      </div>
    );
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
   * 2) 만든 모임
   * =========================================== */
  const { data: createdPosts } = await supabase
    .from('posts')
    .select('id, title, date_time, status')
    .eq('author_id', user.id)
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

  return (
    <div className="space-y-6">
      <Card className="p-0">
        <ProfileHeader
          name={name}
          avatarUrl={avatarUrl}
          stats={stats}
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

      {/* ============================
          🔥 실제 참여 횟수 기반 뱃지 표시
      =============================== */}
      <Card className="p-0">
        <TrophySection
          titleIcon={<Trophy className="h-5 w-5 text-primary" />}
          badges={badges} // ← 여기 핵심!!!
        />
      </Card>

      <Card className="p-0">
        <ActivityTabs
          defaultTab="participated"
          tabs={[
            {
              key: 'participated',
              label: (
                <>
                  <Calendar className="h-4 w-4 mr-2" />
                  참여한 모임
                </>
              ),
              items: participated,
            },
            {
              key: 'created',
              label: (
                <>
                  <Users className="h-4 w-4 mr-2" />
                  만든 모임
                </>
              ),
              items: created,
            },
          ]}
        />
      </Card>
    </div>
  );
}
