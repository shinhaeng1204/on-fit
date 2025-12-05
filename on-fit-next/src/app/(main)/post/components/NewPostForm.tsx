'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/common/Card'
import DropBox from '@/components/common/DropBox'
import { Input } from '@/components/common/Input'
import { TextArea } from '@/components/common/TextArea'
import { Button } from '@/components/common/Button'
import { api } from '@/lib/axios'
import { useRouter } from 'next/navigation'
import LocationPicker from '@/components/location/LocationPicker'

type NewPostFormProps = {
  sportOption: string[]
  levelOption: string[]
}

type PickedLocation = {
  lat: number
  lng: number
  region: string // 예: "부산광역시 남구 대연동"
}

export default function NewPostForm({ sportOption, levelOption }: NewPostFormProps) {
  const [sport, setSport] = useState(sportOption[0])
  const [level, setLevel] = useState(levelOption[0])
  const [loading, setLoading] = useState(false)

  // 📍 LocationPicker에서 받은 위치 정보 (좌표 + 시/구/동 텍스트)
  const [pickedLocation, setPickedLocation] = useState<PickedLocation | null>(null)

  // 세부 장소 (코트/층/건물명 등)
  const [detailLocation, setDetailLocation] = useState('')

  const router = useRouter()

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const fd = new FormData(form)

    // ✅ 위치 필수 체크
    if (!pickedLocation) {
      alert('지도에서 모임 위치를 선택해주세요.')
      return
    }

    if (!detailLocation.trim()) {
      alert('세부 장소를 입력해주세요.')
      return
    }

    const location = `${pickedLocation.region} ${detailLocation.trim()}`.trim()

    const payload = {
      sport: fd.get('sport'),
      title: fd.get('title'),
      description: fd.get('description') || '',
      location, // 카카오맵 기준 "시/군/동 + 세부 장소" 전체 문자열
      date: fd.get('date'),
      time: fd.get('time'),
      level: fd.get('level'),
      maxParticipants: Number(fd.get('maxParticipants') || 0),
      currentParticipants: 1,
      status: '모집중',
      author: '테스트유저',
      requirement: fd.get('requirement') || '',
      fee: fd.get('fee') || '',
      latitude: pickedLocation.lat,
      longitude: pickedLocation.lng,
      regionLabel: pickedLocation.region,
    }

    try {
      setLoading(true)
      await api.post('/api/posts', payload)
      alert('모임이 생성되었습니다!')
      form.reset()

      // 컨트롤드 상태 초기화
      setSport(sportOption[0])
      setLevel(levelOption[0])
      setPickedLocation(null)
      setDetailLocation('')

      router.push('/')
    } catch (err: any) {
      alert(`생성 실패: ${err.response?.data?.error ?? err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const labelCls =
    'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'

  return (
    <main className="container mx-auto px-4 py-8 max-w-2xl">
      <Card>
        <CardHeader className="flex flex-col space-y-1.5 p-6">
          <h3 className="text-2xl font-semibold tracking-tight">번개 모임 만들기</h3>
          <p className="text-sm text-muted-foreground">
            함께 운동할 사람들을 모집해보세요!
          </p>
        </CardHeader>

        <CardContent className="p-6 pt-0">
          <form className="space-y-6" onSubmit={onSubmit}>
            {/* 운동 종목 */}
            <div className="flex flex-col space-y-2">
              <label className={labelCls}>운동 종목 *</label>
              <DropBox
                name="sport"
                value={sport}
                onChange={setSport}
                options={sportOption}
                className="w-full"
                required
              />
            </div>

            {/* 제목 */}
            <div className="flex flex-col space-y-2">
              <label className={labelCls}>제목 *</label>
              <Input
                name="title"
                type="text"
                placeholder="예: 강남 배드민턴 초급자 모집!"
                required
              />
            </div>

            {/* 소개 */}
            <div className="flex flex-col space-y-2">
              <label className={labelCls}>소개</label>
              <TextArea
                name="description"
                placeholder="모임에 대해 간단히 소개해주세요"
              />
            </div>

            {/* 📍 장소 (LocationPicker + 세부 장소) */}
            <div className="flex flex-col space-y-3">
              <label className={labelCls}>장소 *</label>

              <LocationPicker
                appKey={process.env.NEXT_PUBLIC_KAKAO_APP_KEY!}
                onPick={(payload) => {
                  setPickedLocation(payload)
                }}
              />

              <div className="flex flex-col space-y-1">
                <Input
                  name="detailLocation"
                  type="text"
                  value={detailLocation}
                  onChange={(e) => setDetailLocation(e.target.value)}
                  placeholder="예: ○○체육관 2층 A코트"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  지도에서 대략적인 위치를 선택하고, 위 입력칸에 체육관 이름/코트/층 등 상세 정보를 적어주세요.
                </p>
                {pickedLocation && (
                  <p className="text-xs text-muted-foreground">
                    선택된 지역: <span className="font-medium">{pickedLocation.region}</span>
                  </p>
                )}
              </div>
            </div>

            {/* 날짜 및 시간 */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col space-y-2">
                <label className={labelCls}>날짜 *</label>
                <Input
                  name="date"
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              <div className="flex flex-col space-y-2">
                <label className={labelCls}>시간 *</label>
                <Input name="time" type="time" defaultValue={'12:00'} required />
              </div>
            </div>

            {/* 인원 및 기준 */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col space-y-2">
                <label className={labelCls}>모집 인원 *</label>
                <Input
                  name="maxParticipants"
                  type="number"
                  placeholder="예: 6"
                  required
                  min={2}
                />
              </div>
              <div className="flex flex-col space-y-2">
                <label className={labelCls}>실력 기준 *</label>
                <DropBox
                  name="level"
                  value={level}
                  onChange={setLevel}
                  options={levelOption}
                  required
                />
              </div>
            </div>

            {/* 준비물 */}
            <div className="flex flex-col space-y-2">
              <label className={labelCls}>준비물</label>
              <Input
                name="requirement"
                type="text"
                placeholder="예: 라켓(대여 가능), 운동화"
              />
            </div>

            {/* 참가비 */}
            <div className="flex flex-col space-y-2">
              <label className={labelCls}>참가비</label>
              <Input
                name="fee"
                type="text"
                placeholder="예: 15,000원 (시설비 포함)"
              />
            </div>

            {/* 버튼 */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="cursor-pointer"
                fullWidth
                onClick={() => router.back()}
              >
                취소
              </Button>
              <Button
                type="submit"
                variant="hero"
                className="cursor-pointer"
                fullWidth
                disabled={loading}
              >
                {loading ? '등록 중…' : '모임 만들기'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}
