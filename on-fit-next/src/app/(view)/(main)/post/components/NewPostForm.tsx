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
import { SIDO_OPTIONS, getSigunguOptions } from '@/constants/korea-regions'
import { postType } from '@/types/post'
import {handleMaxLength} from "@/lib/handle-max-length";
import {useQueryClient} from "@tanstack/react-query";

type Mode = 'create' | 'edit'

type NewPostFormProps = {
  sportOption: string[]
  levelOption: string[]
  mode?: Mode
  initialData?: postType
}

type PickedLocation = {
  lat: number
  lng: number
  region: string // 예: "부산광역시 남구 대연동"
}

// "서울특별시 강남구 역삼동 ○○체육관" 같은 location 문자열 파싱
function parseLocation(location?: string | null) {
  if (!location) return { sido: '서울특별시', sigungu: '', detail: '' }
  const parts = location.trim().split(' ')
  return {
    sido: parts[0] ?? '서울특별시',
    sigungu: parts[1] ?? '',
    detail: parts.slice(2).join(' ') ?? '',
  }
}

// LocationPicker에서 넘어오는 region 문자열 → 시/도, 시군구 추출
function parseRegionLabel(region: string) {
  const parts = region.trim().split(' ')
  return {
    sido: parts[0] ?? '서울특별시',
    sigungu: parts[1] ?? '',
  }
}

// DB에 저장된 date_time → input[type=date], input[type=time] 로 분리 (KST 기준)
function splitDateTime(dateTime?: string | null) {
  if (!dateTime) return { date: '', time: '' }

  const d = new Date(dateTime)
  if (isNaN(d.getTime())) return { date: '', time: '' }

  // KST (UTC+9) 보정
  const korea = new Date(d.getTime() + 9 * 60 * 60 * 1000)

  const year = korea.getUTCFullYear()
  const month = String(korea.getUTCMonth() + 1).padStart(2, '0')
  const day = String(korea.getUTCDate()).padStart(2, '0')

  const hour = String(korea.getUTCHours()).padStart(2, '0')
  const minute = String(korea.getUTCMinutes()).padStart(2, '0')

  return {
    date: `${year}-${month}-${day}`,
    time: `${hour}:${minute}`,
  }
}

export default function NewPostForm({
  sportOption,
  levelOption,
  mode = 'create',
  initialData,
}: NewPostFormProps) {
  const router = useRouter()
  const queryClient = useQueryClient()

  const parsedLocation = initialData ? parseLocation(initialData.location) : null
  const dt = splitDateTime(initialData?.date_time)

  const defaultSido = parsedLocation?.sido ?? '서울특별시'
  const defaultSigungu =
    parsedLocation?.sigungu ?? getSigunguOptions(defaultSido)[0] ?? ''

  // 선택 상태들
  const [sport, setSport] = useState(initialData?.sport ?? sportOption[0])
  const [level, setLevel] = useState(initialData?.level ?? levelOption[0])
  const [loading, setLoading] = useState(false)

  const [sido, setSido] = useState(defaultSido)
  const [sigungu, setSigungu] = useState(defaultSigungu)
  const [detailLocation, setDetailLocation] = useState(parsedLocation?.detail ?? '')

  // 카카오맵에서 선택한 위치 (좌표 + regionLabel)
  const [pickedLocation, setPickedLocation] = useState<PickedLocation | null>(() => {
    if (initialData?.latitude && initialData?.longitude) {
      return {
        lat: initialData.latitude,
        lng: initialData.longitude,
        region:
          // region_label 있으면 우선 사용, 없으면 location 기준으로 만들어줌
          (initialData as any).region_label ??
          `${defaultSido} ${defaultSigungu}`,
      }
    }
    return null
  })

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const fd = new FormData(form)

    const sidoVal = fd.get('sido') as string | null
    const sigunguVal = fd.get('sigungu') as string | null
    const detailVal = fd.get('detailLocation') as string | null

    // 드롭다운 + 세부 장소 필수
    if (!sidoVal || !sigunguVal || !detailVal?.trim()) {
      alert('시/도, 시·군·구, 세부 장소를 모두 입력해주세요.')
      return
    }

    // 지도 위치 필수
    if (!pickedLocation) {
      alert('지도에서 모임 위치를 선택해주세요.')
      return
    }

    const location = `${sidoVal} ${sigunguVal} ${detailVal.trim()}`.trim()

    const payload: any = {
      sport: fd.get('sport'),
      title: fd.get('title'),
      description: fd.get('description') || '',
      location, // 백엔드는 여전히 location 하나만 사용
      date: fd.get('date'),
      time: fd.get('time'),
      level: fd.get('level'),
      maxParticipants: Number(fd.get('maxParticipants') || 0),
      currentParticipants: 1,
      status: '모집중',
      author: '테스트유저',
      requirement: fd.get('requirement') || '',
      fee: fd.get('fee') || '',
    }

    // 좌표 + regionLabel 같이 전송 (새 컬럼용)
    if (pickedLocation) {
      payload.latitude = pickedLocation.lat
      payload.longitude = pickedLocation.lng
      payload.regionLabel = pickedLocation.region
    }

    try {
      setLoading(true)

      if (mode === 'create') {
        await api.post('/api/posts', payload)
        alert('모임이 생성되었습니다!')
      } else {
        await api.patch(`/api/posts/${initialData?.id}`, payload)
        alert('수정되었습니다.')
      }

      form.reset()

      // 컨트롤드 상태 초기화
      setSport(sportOption[0])
      setLevel(levelOption[0])
      setSido('서울특별시')
      setSigungu(getSigunguOptions('서울특별시')[0] ?? '')
      setDetailLocation('')
      setPickedLocation(null)

      await queryClient.invalidateQueries({
        queryKey: ["posts"],
      })

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
          <h3 className="text-2xl font-semibold tracking-tight">
            {mode === 'create' ? '번개 모임 만들기' : '번개 모임 수정하기'}
          </h3>
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
                placeholder="예: 강남 배드민턴 초급자 모집! (최대 50자)"
                defaultValue={initialData?.title}
                required
                onChange={(e) => handleMaxLength(e, 50)}
              />
            </div>

            {/* 소개 */}
            <div className="flex flex-col space-y-2">
              <label className={labelCls}>소개</label>
              <TextArea
                name="description"
                placeholder="모임에 대해 간단히 소개해주세요"
                defaultValue={initialData?.description}
              />
            </div>

            {/* 📍 장소 (LocationPicker + 시/도/시군구 + 세부 장소) */}
            <div className="flex flex-col space-y-3">
              <label className={labelCls}>장소 *</label>

              <LocationPicker
               
                onPick={(loc) => {
                  setPickedLocation(loc)

                  // 지도에서 선택한 region 기준으로 시/도, 시군구 동기화
                  const parsed = parseRegionLabel(loc.region)
                  setSido(parsed.sido)
                  const sigunguOptions = getSigunguOptions(parsed.sido)
                  setSigungu(
                    parsed.sigungu && sigunguOptions.includes(parsed.sigungu)
                      ? parsed.sigungu
                      : sigunguOptions[0] ?? ''
                  )
                }}
              />

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="flex flex-col space-y-2">
                  <label className={labelCls}>시 / 도 *</label>
                  <DropBox
                    name="sido"
                    value={sido}
                    onChange={(value) => {
                      setSido(value)
                      const first = getSigunguOptions(value)[0]
                      setSigungu(first ?? '')
                    }}
                    options={SIDO_OPTIONS}
                    required
                  />
                </div>

                <div className="flex flex-col space-y-2">
                  <label className={labelCls}>시·군·구 *</label>
                  <DropBox
                    name="sigungu"
                    value={sigungu}
                    onChange={setSigungu}
                    options={getSigunguOptions(sido)}
                    required
                  />
                </div>

                <div className="flex flex-col space-y-2">
                  <label className={labelCls}>세부 장소 *</label>
                  <Input
                    name="detailLocation"
                    type="text"
                    placeholder="광체육관 (최대 200자)"
                    value={detailLocation}
                    onChange={(e) => {
                      setDetailLocation(e.target.value)
                      handleMaxLength(e, 200)
                    }}
                    required
                  />
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                지도에서 대략적인 위치를 선택하고, 위 입력칸에 체육관 이름/코트/층 등 상세 정보를
                적어주세요.
              </p>

              {pickedLocation && (
                <p className="text-xs text-muted-foreground">
                  선택된 지역:{' '}
                  <span className="font-medium">{pickedLocation.region}</span>
                </p>
              )}
            </div>

            {/* 날짜 및 시간 */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col space-y-2">
                <label className={labelCls}>날짜 *</label>
                <Input
                  name="date"
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  defaultValue={dt.date || new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              <div className="flex flex-col space-y-2">
                <label className={labelCls}>시간 *</label>
                <Input
                  name="time"
                  type="time"
                  defaultValue={dt.time || '12:00'}
                  required
                />
              </div>
            </div>

            {/* 인원 및 기준 */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col space-y-2">
                <label className={labelCls}>모집 인원 *</label>
                <Input
                  name="maxParticipants"
                  type="number"
                  placeholder="예: 6 (최소 2명, 최대 100명)"
                  required
                  defaultValue={initialData?.max_participants}
                  min={2}
                  max={100}
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
                defaultValue={initialData?.requirement}
                placeholder="예: 라켓(대여 가능), 운동화 (최대 500자)"
                onChange={(e) => handleMaxLength(e, 500)}
              />
            </div>

            {/* 참가비 */}
            <div className="flex flex-col space-y-2">
              <label className={labelCls}>참가비</label>
              <Input
                name="fee"
                type="number"
                defaultValue={initialData?.fee}
                placeholder="15000 (최대 1억원)"
                max={1000000000}
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
                {loading
                  ? mode === 'create'
                    ? '등록 중…'
                    : '수정 중…'
                  : mode === 'create'
                    ? '모임 만들기'
                    : '모임 수정하기'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}
