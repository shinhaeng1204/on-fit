'use client';

import { CardHeader, CardTitle, CardContent } from '@/components/common/Card';
import LevelBadge from '@/components/common/Badge';
import { cn } from '@/lib/utils';

type BadgeItem = { id: string; name: string; level: 'bronze' | 'silver' | 'gold' | 'platinum'; description?: string };

export default function BadgeSection({
  titleIcon,
  title = '획득한 뱃지',
  badges,
  className,
}: {
  titleIcon?: React.ReactNode;
  title?: string;
  badges: BadgeItem[];
  className?: string;
}) {
  return (
    <>
      <CardHeader className="flex flex-row items-center gap-2">
        <CardTitle className="flex items-center gap-2">
          {titleIcon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className={cn('pb-5', className)}>
        <div className="grid sm:grid-cols-3 gap-4">
          {badges.map((badge) => (
            <div
              key={badge.id}
              className="flex flex-col items-center p-4 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-colors"
            >
              <div className="w-16 h-16 rounded-full bg-linear-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-3">
                {/* 아이콘 자리는 추후 커스텀 가능 */}
                {/* <Trophy className="h-8 w-8 text-primary" /> */}
                <span className="text-lg font-semibold text-primary">★</span>
              </div>
              <LevelBadge type={badge.level} className="mb-2" />
              <p className="text-xs text-muted-foreground text-center">{badge.description}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </>
  );
}
