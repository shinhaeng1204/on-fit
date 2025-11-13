import { CardHeader, CardTitle, CardContent } from '@/components/common/Card';
import { Dumbbell, Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';
import PreferredExercisesEditor from '@/app/mypage/components/_client/PreferredExercisesEditor'; // 👈 아래 파일

export default function PreferredExercisesSection({
  exercises,
  className,
}: {
  exercises: string[];
  className?: string;
}) {
  return (
    <>
      <CardHeader className="flex flex-row items-center gap-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Dumbbell className="h-5 w-5 text-primary" />
          선호하는 운동
        </CardTitle>
      </CardHeader>

      <CardContent className={cn('pb-5', className)}>
        <div className="rounded-lg bg-secondary/30 p-4 transition-colors">
          {/* 👇 작은 클라 섬: 보기/편집 모드 전환 + 저장만 담당 */}
          <PreferredExercisesEditor initial={exercises ?? []} />
        </div>
      </CardContent>
    </>
  );
}