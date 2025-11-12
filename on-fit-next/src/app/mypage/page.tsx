import { Trophy, Calendar, Users } from 'lucide-react';
import { Card } from '@/components/common/Card';
import ProfileHeader from '@/app/mypage/components/ProfileHeader';
import BadgeSection from '@/app/mypage/components/BadgeSection';
import ActivityTabs from '@/app/mypage/components/ActivityTabs';
import RegionSection from '@/app/mypage/components/RegionSection';
import PreferredExercisesSection from '@/app/mypage/components/PreferredExercisesSection';
import { createSupabaseServerClient } from '@/lib/route-helpers';

export default async function MyPage() {
  const supabase =  await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return <div className="p-6">로그인이 필요합니다.</div>;
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
  const level = 'gold' as const;
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
          badges={[] /* 추후 뱃지 테이블 연동 시 교체 */}
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
