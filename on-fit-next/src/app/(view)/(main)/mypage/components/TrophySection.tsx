// src/app/mypage/components/TrophySection.tsx
import { CardHeader, CardTitle, CardContent } from '@/components/common/Card';
import LevelBadge from '@/components/common/Badge';
import { cn } from '@/lib/utils';
import { BadgeType } from '@/types/post';
import { Trophy, Sprout } from 'lucide-react';

type BadgeItem = {
  id: string;
  name: string;
  level: BadgeType;
  description?: string;
};

type Props = {
  titleIcon?: React.ReactNode;
  title?: string;
  badges: BadgeItem[];
  className?: string;
};

// 레벨별 트로피 배경/스타일
const TROPHY_BG_BY_LEVEL: Record<BadgeType, string> = {
  초심자:
    'bg-gradient-to-br from-green-600/90 via-green-500/90 to-green-300/90 text-white',
  브론즈:
    'bg-gradient-to-br from-amber-900/80 via-amber-700/80 to-amber-500/80 text-amber-50',
  실버:
    'bg-gradient-to-br from-slate-500/90 via-slate-300/90 to-slate-100/90 text-slate-900',
  골드:
    'bg-gradient-to-br from-yellow-600/90 via-yellow-400/90 to-amber-200/90 text-yellow-950',
  플레티넘:
    'bg-gradient-to-br from-cyan-500/90 via-sky-300/90 to-slate-100/90 text-slate-900',
};

export default function TrophySection({
  titleIcon,
  title = '나의 트로피',
  badges,
  className,
}: Props) {
  const headerIcon = titleIcon ?? <Trophy className="h-5 w-5 text-primary" />;

  return (
    <>
      <CardHeader className="flex flex-row items-center gap-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          {headerIcon}
          {title}
        </CardTitle>
      </CardHeader>

      <CardContent className={cn('pb-5', className)}>
        {badges.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            아직 획득한 트로피가 없어요.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-3">
            {badges.map((badge) => (
              <div
                key={badge.id}
                className="flex flex-col items-center rounded-lg bg-secondary/30 p-4 transition-colors hover:bg-secondary/50"
              >
                {/* 트로피 / 초심자 아이콘 */}
                <div
                  className={cn(
                    'mb-3 flex h-16 w-16 items-center justify-center rounded-full border border-white/30 shadow-inner shadow-black/20',
                    TROPHY_BG_BY_LEVEL[badge.level],
                  )}
                >
                  {badge.level === '초심자' ? (
                    <Sprout className="h-8 w-8 drop-shadow-sm" />
                  ) : (
                    <Trophy className="h-8 w-8 drop-shadow-sm" />
                  )}
                </div>

                {/* 레벨 인디케이터 (색/스타일만, 텍스트 X) */}
                <LevelBadge
                  type={badge.level}
                  showLabel={false}
                  className="mb-1"
                />

                {/* 뱃지 이름(텍스트는 여기서만 한 번) */}
                <p className="text-sm font-semibold">{badge.name}</p>

                {/* 설명 */}
                {badge.description && (
                  <p className="mt-1 px-2 text-center text-xs text-muted-foreground">
                    {badge.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </>
  );
}
