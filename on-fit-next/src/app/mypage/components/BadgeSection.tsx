import { CardHeader, CardTitle, CardContent } from '@/components/common/Card';
import LevelBadge from '@/components/common/Badge';
import { cn } from '@/lib/utils';
import {BadgeType} from "@/types/post";

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

export default function BadgeSection({
  titleIcon,
  title = '획득한 뱃지',
  badges,
  className,
}: Props) {
  return (
    <>
      <CardHeader className="flex flex-row items-center gap-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          {titleIcon}
          {title}
        </CardTitle>
      </CardHeader>

      <CardContent className={cn('pb-5', className)}>
        {badges.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            아직 획득한 뱃지가 없어요.
          </p>
        ) : (
          <div className="grid sm:grid-cols-3 gap-4">
            {badges.map((badge) => (
              <div
                key={badge.id}
                className="flex flex-col items-center p-4 rounded-lg bg-secondary/30
                           hover:bg-secondary/50 transition-colors"
              >
                <div className="w-16 h-16 rounded-full bg-linear-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-3">
                  <span className="text-lg font-semibold text-primary">★</span>
                </div>

                <LevelBadge type={badge.level} className="mb-2" />

                {badge.description && (
                  <p className="text-xs text-muted-foreground text-center px-2">
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
