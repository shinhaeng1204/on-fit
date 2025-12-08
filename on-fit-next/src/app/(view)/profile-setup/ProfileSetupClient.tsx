// app/profile-setup/ProfileSetupClient.tsx
'use client'

import { useRef } from 'react'
import { Dumbbell, MapPin, User } from 'lucide-react'
import LocationPicker from '@/components/location/LocationPicker'

const EXERCISES = [
  '축구','농구','야구','배구','테니스',
  '배드민턴','탁구','러닝','등산','자전거',
  '수영','헬스','요가','필라테스','클라이밍'
]

type Props = {
  saveProfile: (formData: FormData) => Promise<void>
}

export default function ProfileSetupClient({ saveProfile }: Props) {
  const regionRef = useRef<HTMLInputElement>(null)
  const latRef = useRef<HTMLInputElement>(null)
  const lngRef = useRef<HTMLInputElement>(null)

  return (
    <form
      action={saveProfile}
      className="w-full max-w-2xl"
    >
      <div className="rounded-xl border bg-card">
        {/* 🔹 헤더 영역 - 원래 디자인 그대로 */}
        <div className="p-6 text-center border-b">
          <h1 className="text-2xl font-semibold">프로필 설정</h1>
          <p className="text-sm text-muted-foreground mt-1">
            서비스를 시작하기 전에 프로필을 설정해주세요
          </p>
        </div>

        {/* 🔹 내용 영역 */}
        <div className="p-6 space-y-6">
          {/* 닉네임 */}
          <div className="space-y-2">
            <label htmlFor="nickname" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              닉네임
            </label>
            <input
              id="nickname"
              name="nickname"
              placeholder="닉네임을 입력하세요"
              className="w-full rounded-md border bg-background px-3 py-2"
              required
            />
          </div>

          {/* 동네 */}
          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              나의 동네
            </label>

            {/* LocationPicker에서 채울 hidden input 3개 */}
            <input type="hidden" name="region" ref={regionRef} />
            <input type="hidden" name="lat" ref={latRef} />
            <input type="hidden" name="lng" ref={lngRef} />

            <LocationPicker
              onPick={({ lat, lng, region }) => {
                if (regionRef.current) regionRef.current.value = region
                if (latRef.current) latRef.current.value = String(lat)
                if (lngRef.current) lngRef.current.value = String(lng)
              }}
            />
          </div>

          {/* 선호 운동 (원래 구조 유지, 예시는 EXERCISES 배열 사용) */}
          <div className="space-y-3">
            <label className="flex items-center gap-2">
              <Dumbbell className="w-4 h-4" />
              선호하는 운동
            </label>
            <p className="text-sm text-muted-foreground">
              관심있는 운동을 선택해주세요 (여러 개 선택 가능)
            </p>

            <div className="flex flex-wrap gap-2">
              {EXERCISES.map((ex) => {
                const id = `ex-${ex}`
                return (
                  <div key={ex} className="inline-block">
                    <input
                      id={id}
                      type="checkbox"
                      name="sport_preference"
                      value={ex}
                      className="peer sr-only"
                    />
                    <label
                      htmlFor={id}
                      className="select-none rounded-full border px-3 py-1 text-sm transition
                                 cursor-pointer hover:scale-105
                                 peer-checked:bg-primary peer-checked:text-primary-foreground peer-checked:border-primary"
                    >
                      {ex}
                    </label>
                  </div>
                )
              })}
            </div>
          </div>

          {/* 시작하기 버튼 */}
          <button
            type="submit"
            className="w-full rounded-md px-4 py-3 font-medium bg-primary text-primary-foreground hover:opacity-90 transition"
          >
            시작하기
          </button>
        </div>
      </div>
    </form>
  )
}
