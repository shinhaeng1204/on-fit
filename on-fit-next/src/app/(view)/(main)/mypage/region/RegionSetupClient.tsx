'use client';

import { useRef } from 'react';
import { MapPin } from 'lucide-react';
import LocationPicker from '@/components/location/LocationPicker';

type Props = {
  saveRegion: (formData: FormData) => Promise<void>;
};

export default function RegionSetupClient({ saveRegion }: Props) {
  const regionRef = useRef<HTMLInputElement>(null);
  const latRef = useRef<HTMLInputElement>(null);
  const lngRef = useRef<HTMLInputElement>(null);

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
              }}
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-md px-4 py-3 font-medium bg-primary text-primary-foreground hover:opacity-90 transition"
          >
            동네 저장하기
          </button>
        </div>
      </div>
    </form>
  );
}
