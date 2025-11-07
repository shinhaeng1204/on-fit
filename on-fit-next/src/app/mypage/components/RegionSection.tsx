'use client';

import { CardHeader, CardTitle, CardContent } from '@/components/common/Card';
import { MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function RegionSection({
  region,
  className,
}: {
  region: string;
  className?: string;
}) {
  return (
    <>
      {/* BadgeSection과 동일한 헤더 구조/간격 */}
      <CardHeader className="flex flex-row items-center gap-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <MapPin className="h-5 w-5 text-primary" />
          나의 지역
        </CardTitle>
      </CardHeader>

      {/* BadgeSection과 동일한 본문 패딩/톤 */}
      <CardContent className={cn('pb-5', className)}>
        <div className="rounded-lg bg-secondary/30 p-4 hover:bg-secondary/50 transition-colors">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 opacity-70" />
            <span className="text-sm font-medium">{region}</span>
          </div>
        </div>
      </CardContent>
    </>
  );
}
