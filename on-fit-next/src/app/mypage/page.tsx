import { Trophy, Calendar, Users} from 'lucide-react';
import { Card } from '@/components/common/Card';
import ProfileHeader from '@/app/mypage/components/ProfileHeader';
import TrophySection from '@/app/mypage/components/TrophySection';
import ActivityTabs from '@/app/mypage/components/ActivityTabs';
import RegionSection from '@/app/mypage/components/RegionSection';
import PreferredExercisesSection from '@/app/mypage/components/PreferredExercisesSection';
import ReviewSection from '@/app/mypage/components/ReviewSection';
import { redirect } from 'next/navigation';

import { createSupabaseServerClient } from '@/lib/route-helpers';
import { getMyPageData } from '@/app/mypage/_api/getMyPageData';

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

   // 참여 수를 실제 데이터 기준으로 쓰고 싶으면 여기서 업데이트
  stats.participationCount = participated.length;
  const mockReviews = [
    {
      id: '1',
      reviewerName: '김철수',
      rating: 5,
      content: '정말 친절하시고 운동도 잘 알려주셨어요! 다음에 또 같이 운동하고 싶습니다.',
      createdAt: '2023-10-25T10:00:00',
    },
    {
      id: '2',
      reviewerName: '이영희',
      rating: 4,
      content: '시간 약속을 잘 지키십니다. 즐거운 시간이었습니다.',
      createdAt: '2023-11-02T14:30:00',
    },
    {
      id: '3',
      reviewerName: '박지민',
      rating: 5,
      content: '에너지가 넘치시는 분이에요! 덕분에 동기부여가 많이 되었습니다.',
      createdAt: '2023-11-15T09:15:00',
    },
  ];

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
      <Card className="p-0">
        <ReviewSection reviews={mockReviews} />
      </Card>
    </div>
  );
}
