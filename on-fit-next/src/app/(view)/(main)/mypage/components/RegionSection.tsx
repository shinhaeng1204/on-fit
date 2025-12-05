import { CardHeader, CardTitle, CardContent } from '@/components/common/Card';
import { MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

type Props = {
  region?: string | null;
  className?: string;
};

export default function RegionSection({ region, className }: Props) {
  return (
    <>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-lg">
          <MapPin className="h-5 w-5 text-primary" />
          나의 지역
        </CardTitle>
      </CardHeader>

      <CardContent className={cn('pb-5', className)}>
        <div className="rounded-lg bg-secondary/30 p-4">
          {region ? (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 opacity-70" />
              <span className="font-medium">{region}</span>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              아직 설정된 지역이 없어요. 동네 설정 화면에서 등록해 주세요.
            </p>
          )}
        </div>
      </CardContent>
    </>
  );
}
