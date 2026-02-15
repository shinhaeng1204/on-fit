import { CardHeader, CardTitle, CardContent } from '@/components/common/Card';
import LevelBadge from '@/components/common/Badge';
import { cn } from '@/lib/utils';
import type { BadgeType } from '@/types/post';
import { Trophy, Sprout, Sparkles } from 'lucide-react';

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
  첫걸음:
    'bg-gradient-to-br from-green-600/90 via-green-500/90 to-green-300/90 text-white',
  초심자:
    'bg-gradient-to-br from-sky-500/90 via-sky-400/90 to-sky-300/90 text-sky-950',
  활동가:
    'bg-gradient-to-br from-amber-700/90 via-amber-500/90 to-amber-300/90 text-amber-950',
  베테랑:
    'bg-gradient-to-br from-slate-400/90 via-slate-300/90 to-slate-200/90 text-slate-900',
  레전드:
    'bg-gradient-to-br from-purple-600/90 via-fuchsia-500/90 to-pink-400/90 text-white',
};

// 레벨 우선순위 (숫자가 클수록 높은 레벨)
const LEVEL_PRIORITY: Record<BadgeType, number> = {
  첫걸음: 0,
  초심자: 1,
  활동가: 2,
  베테랑: 3,
  레전드: 4,
};

// ✅ 아이콘 분기 로직을 함수로 분리 (가독성 + 확장성)
function TrophyIcon({ level }: { level: BadgeType }) {
  // 첫걸음 = 새싹
  if (level === '첫걸음') {
    return <Sprout className="h-8 w-8 drop-shadow-sm" />;
  }

  // 레전드 = 조금 더 존재감 (반짝임 + 더 강한 그림자)
  if (level === '레전드') {
    return (
      <div className="relative">
        <Trophy className="h-8 w-8 drop-shadow-lg" />
        <Sparkles className="absolute -right-2 -top-2 h-4 w-4 opacity-90" />
      </div>
    );
  }

  // 나머지 = 기본 트로피
  return <Trophy className="h-8 w-8 drop-shadow-sm" />;
}

export default function TrophySection({
  titleIcon,
  title = '나의 트로피',
  badges,
  className,
}: Props) {
  const headerIcon = titleIcon ?? <Trophy className="h-5 w-5 text-primary" />;

  // ✅ 가장 높은 트로피가 앞에 오도록 정렬
  const sortedBadges = [...badges].sort(
    (a, b) => LEVEL_PRIORITY[b.level] - LEVEL_PRIORITY[a.level],
  );

  return (
    <>
      <CardHeader className="flex flex-row items-center gap-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          {headerIcon}
          {title}
        </CardTitle>
      </CardHeader>

      <CardContent className={cn('pb-5', className)}>
        {sortedBadges.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            아직 획득한 트로피가 없어요.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-3">
            {sortedBadges.map((badge) => (
              <div
                key={badge.id}
                className="flex flex-col items-center rounded-lg bg-secondary/30 p-4 transition-colors hover:bg-secondary/50"
              >
                {/* 트로피 아이콘 */}
                <div
                  className={cn(
                    'mb-3 flex h-16 w-16 items-center justify-center rounded-full border border-white/30 shadow-inner shadow-black/20',
                    TROPHY_BG_BY_LEVEL[badge.level],
                  )}
                >
                  <TrophyIcon level={badge.level} />
                </div>

                {/* 레벨 인디케이터 (색/스타일만, 텍스트 X) */}
                <LevelBadge
                  type={badge.level}
                  showLabel={false}
                  className="mb-1"
                />

                {/* 트로피 이름 */}
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
