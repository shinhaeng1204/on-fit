'use client';

import { useState, useEffect } from 'react';
import { CardHeader, CardTitle, CardContent } from '@/components/common/Card';
import { MapPin, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/app/mypage/components/Toast';
import { updateRegionDirect } from '@/app/mypage/actions';

type Props = {
  region: string;
  className?: string;
};

const REGIONS = [
  '서울특별시',
  '경기도',
  '인천광역시',
  '부산광역시',
  '대구광역시',
  '광주광역시',
  '대전광역시',
  '울산광역시',
  '제주특별자치도',
];

export default function RegionSection({ region, className }: Props) {
  const { show } = useToast?.() ?? { show: () => {} };

  const [value, setValue] = useState(region);
  const [saving, setSaving] = useState(false);

  // 부모에서 region이 바뀌면 동기화
  useEffect(() => {
    setValue(region);
  }, [region]);

  const handleChange = async (newRegion: string) => {
    const prev = value;
    setValue(newRegion); // UI 먼저 업데이트

    try {
      setSaving(true);
      await updateRegionDirect(newRegion);
      show?.('지역이 업데이트됐어요!');
    } catch (e) {
      console.error(e);
      setValue(prev); // 실패 시 롤백
      show?.('저장에 실패했어요. 다시 시도해 주세요.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-lg">
          <MapPin className="h-5 w-5 text-primary" />
          나의 지역
        </CardTitle>
      </CardHeader>

      <CardContent className={cn('pb-5', className)}>
        <div className="rounded-lg bg-secondary/30 p-4 hover:bg-secondary/50 transition-colors">
          <div className="relative">

            {/* 왼쪽 MapPin */}
            <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-70" />

            {/* 드롭다운 Select */}
            <select
              value={value}
              disabled={saving}
              onChange={(e) => handleChange(e.target.value)}
              className="w-full appearance-none rounded-md bg-transparent pl-9 pr-8 py-2 text-sm
                         focus:outline-none focus:ring-2 focus:ring-primary/40
                         border border-border/60"
            >
              {REGIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>

            {/* 오른쪽 ChevronDown 아이콘 */}
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-70" />
          </div>
        </div>
      </CardContent>
    </>
  );
}
