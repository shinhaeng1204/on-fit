'use client';

import { CardHeader, CardTitle, CardContent } from '@/components/common/Card';
import { Dumbbell } from 'lucide-react';
import { cn } from '@/lib/utils';

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
        <div className="flex flex-wrap gap-2">
          {exercises.map((label) => (
            <span
              key={label}
              className="rounded-full bg-secondary/30 px-3 py-1 text-sm hover:bg-secondary/50 transition-colors"
            >
              {label}
            </span>
          ))}
        </div>
      </CardContent>
    </>
  );
}
