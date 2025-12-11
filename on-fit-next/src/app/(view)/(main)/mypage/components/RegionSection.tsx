// src/app/(view)/(main)/mypage/components/RegionSection.tsx
import Link from 'next/link';
import { CardHeader, CardTitle, CardContent } from '@/components/common/Card';
import { MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

const REGION_SETTINGS_PATH = '/mypage/region'; // ✅ 새로 만들 페이지

type Props = {
  region?: string | null;
  className?: string;
};

export default function RegionSection({ region, className }: Props) {
  const hasRegion = !!region;

  return (
    <>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-lg">
          <MapPin className="h-5 w-5 text-primary" />
          나의 동네
        </CardTitle>

        {hasRegion && (
          <Link
            href={REGION_SETTINGS_PATH}
            className="text-xs text-primary hover:underline"
          >
            변경하기
          </Link>
        )}
      </CardHeader>

      <CardContent
        className={cn('flex h-full flex-1 flex-col pb-5', className)}
      >
        <div className="flex flex-1 flex-col justify-center rounded-lg bg-secondary/30 p-4">
          {hasRegion ? (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 opacity-70" />
              <span className="font-medium">{region}</span>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                아직 설정된 동네가 없어요.
              </p>
              <Link
                href={REGION_SETTINGS_PATH}
                className="inline-flex items-center justify-center rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary-hover"
              >
                동네 설정하러 가기
              </Link>
            </div>
          )}
        </div>
      </CardContent>
    </>
  );
}
