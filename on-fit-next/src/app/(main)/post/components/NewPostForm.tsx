'use client'
import { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/common/Card'
import DropBox from '@/components/common/DropBox'
import { Input } from '@/components/common/Input'
import { TextArea } from '@/components/common/TextArea'
import { Button } from '@/components/common/Button'
import { api } from '@/lib/axios'
import { useRouter } from 'next/navigation'
import { SIDO_OPTIONS, getSigunguOptions } from '@/constants/korea-regions'
import {postType} from "@/types/post";
import {toKstDate, toKstTime} from "@/lib/dateFormatter";

export default function NewPostForm({ sportOption, levelOption, mode = 'create', initialData }: {
  sportOption: string[]
  levelOption: string[]
  mode: string
  initialData?: postType
}) {
  const router = useRouter()

  const [sport, setSport] = useState(initialData?.sport ?? sportOption[0])
  const [level, setLevel] = useState(initialData?.level ?? levelOption[0])
  const [loading, setLoading] = useState(false)

  function parseLocation(location: string) {
    if (!location) return { sido: '서울특별시', sigungu: '', detail: '' }
    const parts = location.trim().split(' ')
    console.log(parts.slice(2).join(' '))
    return {
      sido: parts[0] ?? '서울특별시',
      sigungu: parts[1] ?? '',
      detail: parts.slice(2).join(' ') ?? ''
    }
  }

  const parsed = initialData ? parseLocation(initialData.location) : null

  // 지역 선택 상태
  const [sido, setSido] = useState(parsed?.sido ?? '서울특별시')
  const [sigungu, setSigungu] = useState(
    parsed?.sigungu ?? getSigunguOptions('서울특별시')[0] ?? ''
  )
  const [detailLocation, setDetailLocation] = useState(parsed?.detail ?? '')

  // 시간
  function splitDateTime(dateTime?: string) {
    if (!dateTime) return { date: "", time: "" };

    const d = new Date(dateTime);
    if (isNaN(d.getTime())) return { date: "", time: "" };

    // KST 기준 시차 적용 (UTC+9)
    const korea = new Date(d.getTime() + 9 * 60 * 60 * 1000);

    const year = korea.getUTCFullYear();
    const month = String(korea.getUTCMonth() + 1).padStart(2, "0");
    const day = String(korea.getUTCDate()).padStart(2, "0");

    const hour = String(korea.getUTCHours()).padStart(2, "0");
    const minute = String(korea.getUTCMinutes()).padStart(2, "0");

    return {
      date: `${year}-${month}-${day}`,  // ✅ 2025-12-13
      time: `${hour}:${minute}`,        // ✅ 06:00
    };
  }

  const dt = splitDateTime(initialData?.date_time)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const fd = new FormData(form)

    // 폼에서 지역 정보 꺼내기
    const sido = fd.get('sido') as string | null
    const sigungu = fd.get('sigungu') as string | null
    const detailLocation = fd.get('detailLocation') as string | null

    if (!sido || !sigungu || !detailLocation) {
      alert('시/도, 시·군·구, 세부 장소를 모두 입력해주세요.')
      return
    }

    const location = `${sido} ${sigungu} ${detailLocation}`.trim()

    const payload = {
      sport: fd.get('sport'),
      title: fd.get('title'),
      description: fd.get('description') || '',
      location, // ✅ 백엔드는 여전히 location 하나만 사용
      date: fd.get('date'),
      time: fd.get('time'),
      level: fd.get('level'),
      maxParticipants: Number(fd.get('maxParticipants') || 0),
      currentParticipants: 1,
      status: '모집중',
      author: '테스트유저',
      requirement: fd.get('requirement') || '',
      fee: fd.get('fee') || '',
      // 백엔드 스키마에 없으니까 굳이 안 보냄
      // sido, sigungu, detailLocation 은 프론트에서만 사용
    }

    try {
      setLoading(true)
      if(mode === 'create') {
        await api.post(`/api/posts`, payload)
        alert('모임이 생성되었습니다!')
      } else {
        if (!initialData) {
          throw new Error("initialData is missing for update mode")
        }
        await api.patch(`/api/posts/${initialData.id}`, payload)
        alert('수정되었습니다.')
      }

      form.reset()

      // 컨트롤드 컴포넌트 상태도 같이 초기화
      setSport(sportOption[0])
      setLevel(levelOption[0])
      setSido('서울특별시')
      setSigungu(getSigunguOptions('서울특별시')[0] ?? '')

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
                placeholder="예: 강남 배드민턴 초급자 모집!"
                defaultValue={initialData?.title}
                required
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

            {/* 장소 */}
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
                  placeholder="예: ○○체육관 2층 A코트"
                  value={detailLocation}
                  onChange={(e) => setDetailLocation(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* 날짜 및 시간 */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col space-y-2">
                <label className={labelCls}>날짜 *</label>
                <Input
                  name="date"
                  type="date"
                  min={new Date().toISOString().split("T")[0]}
                  defaultValue={dt.date}
                  required />
              </div>
              <div className="flex flex-col space-y-2">
                <label className={labelCls}>시간 *</label>
                <Input
                  name="time"
                  type="time"
                  defaultValue={dt.time ?? '12:00'}
                  required />
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
                  defaultValue={initialData?.max_participants}
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
                defaultValue={initialData?.requirement}
                placeholder="예: 라켓(대여 가능), 운동화"
              />
            </div>

            {/* 참가비 */}
            <div className="flex flex-col space-y-2">
              <label className={labelCls}>참가비</label>
              <Input
                name="fee"
                type="text"
                defaultValue={initialData?.fee}
                placeholder="예: 15,000원 (시설비 포함)"
              />
            </div>

            {/* 버튼 */}
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" className="cursor-pointer" fullWidth onClick={() => router.back()}>
                취소
              </Button>
              <Button type="submit" variant="hero" className="cursor-pointer" fullWidth disabled={loading}>
                {loading ? '등록 중…' : '모임 만들기'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}
