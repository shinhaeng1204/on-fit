import Link from 'next/link';
import { Trophy, Calendar, Users, LogIn } from 'lucide-react';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import ProfileHeader from '@/app/mypage/components/ProfileHeader';
import BadgeSection from '@/app/mypage/components/BadgeSection';
import ActivityTabs from '@/app/mypage/components/ActivityTabs';
import RegionSection from '@/app/mypage/components/RegionSection';
import PreferredExercisesSection from '@/app/mypage/components/PreferredExercisesSection';
import { createSupabaseServerClient } from '@/lib/route-helpers';

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

  const { data: profile, error } = await supabase
    .from('profiles')
    .select(
      'id, email, nickname, profile_image, followers, following, location, sport_preference',
    )
    .eq('id', user.id)
    .single();

  if (error) {
    return (
      <div className="p-6">
        프로필을 불러오지 못했습니다: {error.message}
      </div>
    );
  }

  const name = profile?.nickname ?? '';
  const avatarUrl = profile?.profile_image ?? '';
  const level = '골드' as const;
  const stats = {
    participationCount: 0, // 아래에서 실제 참여 수로 바꿀 수도 있음
    followerCount: profile.followers.length,
    followingCount: profile.following.length,
  };
  const region = profile?.location ?? '';
  const exercises = (profile?.sport_preference ?? []) as string[];

  // =============================
  // 만든 모임: posts.author_id = 내 id
  // =============================
  const { data: createdPosts, error: createdError } = await supabase
    .from('posts')
    .select('id, title, date_time, status')
    .eq('author_id', user.id)
    .order('date_time', { ascending: false });

  if (createdError) {
    console.log('created posts error', createdError);
  }

  const created: ActivityItem[] =
    createdPosts?.map((p) => ({
      id: p.id,
      title: p.title,
      date: p.date_time, // ISO string 이라 ActivityTabs에서 포맷 가능
      status: p.status === '모집중' ? 'open' : 'close',
    })) ?? [];

  // =============================
  // 참여한 모임: participants.user_id = 내 id → room_id → posts.room_id
  // =============================
  const { data: participantRows, error: participantError } = await supabase
    .from('participants')
    .select('room_id, joined_at')
    .eq('user_id', user.id)
    .order('joined_at', { ascending: false });

  if (participantError) {
    console.log('participants error', participantError);
  }

  const roomIds = participantRows?.map((row) => row.room_id) ?? [];

  let participated: ActivityItem[] = [];

  if (roomIds.length > 0) {
    const { data: joinedPosts, error: joinedPostsError } = await supabase
      .from('posts')
      .select('id, title, date_time, status, room_id')
      .in('room_id', roomIds);

    if (joinedPostsError) {
      console.log('joined posts error', joinedPostsError);
    }

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

  return (
    <div className="space-y-6">
      <Card className="p-0">
        <ProfileHeader name={name} avatarUrl={avatarUrl} level={level} stats={stats} />
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
        <BadgeSection
          titleIcon={<Trophy className="h-5 w-5 text-primary" />}
          badges={[
            { id: '1', name: '브론즈 뱃지', level: '브론즈', description: '3회 참여' },
            { id: '2', name: '실버 뱃지', level: '실버', description: '10회 참여' },
            { id: '3', name: '골드 뱃지', level: '골드', description: '30회 참여' },
          ]}
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
