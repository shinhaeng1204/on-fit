'use client';

import { useRef, useState } from 'react';
import { MapPin } from 'lucide-react';
import { useRouter } from 'next/navigation';
import LocationPicker from '@/components/location/LocationPicker';

type Props = {
  saveRegion: (formData: FormData) => Promise<void>;
};

export default function RegionSetupClient({ saveRegion }: Props) {
  const router = useRouter();

  const regionRef = useRef<HTMLInputElement>(null);
  const latRef = useRef<HTMLInputElement>(null);
  const lngRef = useRef<HTMLInputElement>(null);

  // 사용자가 실제로 동네를 선택했는지 추적 (취소 시 경고용)
  const [isDirty, setIsDirty] = useState(false);

  const handleCancel = () => {
    if (isDirty) {
      const ok = window.confirm(
        '변경사항이 저장되지 않았습니다. 그대로 나가시겠어요?'
      );
      if (!ok) return;
    }

    // 바로 이전 페이지로 돌아가기
    router.back();
    // 혹은 항상 마이페이지로 보내고 싶으면:
    // router.push('/mypage');
  };

  return (
    <form
      action={saveRegion}
      className="w-full max-w-xl"
    >
      <div className="rounded-xl border bg-card">
        {/* 헤더 */}
        <div className="p-6 border-b">
          <h1 className="text-xl font-semibold">동네 설정</h1>
          <p className="text-sm text-muted-foreground mt-1">
            함께 운동할 동네를 선택해 주세요.
          </p>
        </div>

        {/* 내용 */}
        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium">
              <MapPin className="w-4 h-4" />
              나의 동네
            </label>

            {/* LocationPicker에서 채울 hidden input 3개 */}
            <input type="hidden" name="region" ref={regionRef} />
            <input type="hidden" name="lat" ref={latRef} />
            <input type="hidden" name="lng" ref={lngRef} />

            <LocationPicker
              onPick={({ lat, lng, region }) => {
                if (regionRef.current) regionRef.current.value = region;
                if (latRef.current) latRef.current.value = String(lat);
                if (lngRef.current) lngRef.current.value = String(lng);
                setIsDirty(true); // 사용자가 위치를 한 번이라도 선택하면 dirty 처리
              }}
            />
          </div>

          {/* 버튼 영역: 취소 + 저장 */}
          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={handleCancel}
              className="w-full rounded-md px-4 py-3 text-sm font-medium border border-border bg-background hover:bg-muted transition"
            >
              취소
            </button>

            <button
              type="submit"
              className="w-full rounded-md px-4 py-3 text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 transition"
            >
              동네 저장하기
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
