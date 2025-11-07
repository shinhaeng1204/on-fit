'use client';

import { Trophy, Calendar, Users } from 'lucide-react';
import { Card } from '@/components/common/Card';
import ProfileHeader from '@/app/mypage/components/ProfileHeader';
import BadgeSection from '@/app/mypage/components/BadgeSection';
import ActivityTabs from '@/app/mypage/components/ActivityTabs';
import RegionSection from '@/app/mypage/components/RegionSection';
import PreferredExercisesSection from '@/app/mypage/components/PreferredExercisesSection';

export default function MyPage() {
  const user = {
    id: 'u_1',
    name: '운동왕',
    avatarUrl: '',
    level: 'gold' as const,
    stats: { joinedCount: 23, createdCount: 8, followerCount: 45, followingCount: 32 },
    badges: [
      { id: 'b_bronze', name: '브론즈 뱃지', level: 'bronze' as const, description: '3회 참여' },
      { id: 'b_silver', name: '실버 뱃지', level: 'silver' as const, description: '10회 참여' },
      { id: 'b_gold', name: '골드 뱃지', level: 'gold' as const, description: '50회 참여' },
    ],
  };

  const participated = [
    { id: 'p_1', title: '강남 배드민턴 모임', date: '2024-10-15', status: 'close' as const },
    { id: 'p_2', title: '분당 러닝 번개', date: '2024-10-18', status: 'close' as const },
    { id: 'p_3', title: '신논현 요가 클래스', date: '2024-10-22', status: 'close' as const },
  ];

  const created = [
    { id: 'c_1', title: '서초 풋살 번개', date: '2024-10-20', status: 'open' as const },
    { id: 'c_2', title: '잠실 배구 모임', date: '2024-10-27', status: 'open' as const },
  ];

  const region = "강남구";
  const exercises = ["배드민턴", "풋살", "농구", "테니스"];

  return (
    <div className="space-y-6">
      <Card className="p-0">
        <ProfileHeader
          name={user.name}
          avatarUrl={user.avatarUrl}
          level={user.level}
          stats={{
            participationCount: user.stats.joinedCount,
            followerCount: user.stats.followerCount,
            followingCount: user.stats.followingCount,
          }}
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
          badges={user.badges}
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
