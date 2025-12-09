import { CardHeader, CardTitle, CardContent } from '@/components/common/Card';
import { Dumbbell } from 'lucide-react';
import { cn } from '@/lib/utils';
import PreferredExercisesEditor from '@/app/(view)/(main)/mypage/components/_client/PreferredExercisesEditor';
import { createSupabaseServerClient } from '@/lib/route-helpers';

type Props = {
  exercises: string[];
  className?: string;
};

// ⭐ async (Supabase에서 운동종목 조회)
export default async function PreferredExercisesSection({
  exercises,
  className,
}: Props) {
  const supabase = await createSupabaseServerClient();

  const { data: sportsRows, error } = await supabase
    .from('posts')
    .select('sport')
    .not('sport', 'is', null)
    .order('sport', { ascending: true });

  if (error) {
    console.error('운동종목 불러오기 실패:', error.message);
  }

  const sportsOptions =
    sportsRows
      ?.map((row) => row.sport as string)
      .filter(Boolean)
      // 중복 제거
      .filter((v, i, arr) => arr.indexOf(v) === i) ?? [];

  return (
    <>
      <CardHeader className="flex flex-row items-center gap-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Dumbbell className="h-5 w-5 text-primary" />
          선호하는 운동
        </CardTitle>
      </CardHeader>

      {/* ⭐ 수정: 
        1. flex-1: 남은 공간 꽉 채움 
        2. h-full, flex-col: 높이 상속 
      */}
      <CardContent className={cn('flex h-full flex-1 flex-col pb-5', className)}>
        {/* ⭐ 수정: 
          회색 박스가 부모(CardContent)를 꽉 채우도록 flex-1 설정
          내부 아이템 수직 중앙 정렬 (justify-center)
        */}
        <div className="flex flex-1 flex-col justify-center rounded-lg bg-secondary/30 p-4">
          <div className="w-full">
            <PreferredExercisesEditor
              initial={exercises ?? []}
              options={sportsOptions}
            />
          </div>
        </div>
      </CardContent>
    </>
  );
}