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

export default async function MyPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 py-10">
        <p className="text-sm text-muted-foreground">로그인이 필요합니다.</p>

    <Link href="/auth?next=/mypage">
      <Button size="sm" >
        <LogIn className="mr-2 h-4 w-4" />
           로그인 하러가기
      </Button>
    </Link>
      </div>
    );
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id, email, nickname, profile_image, location, sport_preference')
    .eq('id', user.id)
    .single();

  if (error) {
    return <div className="p-6">프로필을 불러오지 못했습니다: {error.message}</div>;
  }

  const name = profile?.nickname ?? '';
  const avatarUrl = profile?.profile_image ?? '';
  const level = '골드' as const;
  const stats = {
    participationCount: 0,
    followerCount: 0,
    followingCount: 0,
  };
  const region = profile?.location ?? '';
  const exercises = (profile?.sport_preference ?? []) as string[];

  const participated: { id: string; title: string; date: string; status: 'open' | 'close' }[] = [];
  const created: { id: string; title: string; date: string; status: 'open' | 'close' }[] = [];

  return (
    <div className="space-y-6">
      <Card className="p-0">
        <ProfileHeader
          name={name}
          avatarUrl={avatarUrl}
          level={level}
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
              label: (<><Calendar className="h-4 w-4 mr-2" />참여한 모임</>),
              items: participated,
            },
            {
              key: 'created',
              label: (<><Users className="h-4 w-4 mr-2" />만든 모임</>),
              items: created,
            },
          ]}
        />
      </Card>
    </div>
  );
}
