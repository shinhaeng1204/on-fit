'use client'
import { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/common/Card'
import DropBox from '@/components/common/DropBox'
import { Input } from '@/components/common/Input'
import { TextArea } from '@/components/common/TextArea'
import { Button } from '@/components/common/Button'
import { api } from '@/lib/axios'

export default function NewPostForm({sportOption, levelOption}: {
    sportOption: string[]; levelOption: string[];
}) {
  const [sport, setSport] = useState(sportOption[0])
  const [level, setLevel] = useState(levelOption[0])
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const fd = new FormData(form)

    const payload = {
      sport: fd.get('sport'),
      title: fd.get('title'),
      description: fd.get('description') || '',
      location: fd.get('location'),
      date: fd.get('date'),
      time: fd.get('time'),
      level: fd.get('level'),
      maxParticipants: Number(fd.get('maxParticipants') || 0),
      currentParticipants: 1,
      status: '모집중',
      author: '테스트유저',
      equipment: fd.get('equipment') || '',
      fee: fd.get('fee') || '',
    }

    try {
      setLoading(true)
      const res = await api.post('/api/posts', payload)
      alert('모임이 생성되었습니다!')
      form.reset()                 
      setSport(sportOption[0])    
      setLevel(levelOption[0])
      
    } catch (err: any) {
      alert(`생성 실패: ${err.response?.data?.error ?? err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const labelCls = 'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'

  return (
    <main className="container mx-auto px-4 py-8 max-w-2xl">
      <Card>
        <CardHeader className="flex flex-col space-y-1.5 p-6">
          <h3 className="text-2xl font-semibold tracking-tight">번개 모임 만들기</h3>
          <p className="text-sm text-muted-foreground">함께 운동할 사람들을 모집해보세요!</p>
        </CardHeader>

        <CardContent className="p-6 pt-0">
          <form className="space-y-6" onSubmit={onSubmit}>
            {/* 운동 종목 */}
            <div className="flex flex-col space-y-2">
              <label className={labelCls}>운동 종목 *</label>
              <DropBox name="sport" value={sport} onChange={setSport} options={sportOption} className="w-full" required />
            </div>

            {/* 제목 */}
            <div className="flex flex-col space-y-2">
              <label className={labelCls}>제목 *</label>
              <Input name="title" type="text" placeholder="예: 강남 배드민턴 초급자 모집!" required />
            </div>

            {/* 소개 */}
            <div className="flex flex-col space-y-2">
              <label className={labelCls}>소개</label>
              <TextArea name="description" placeholder="모임에 대해 간단히 소개해주세요" />
            </div>

            {/* 장소 */}
            <div className="flex flex-col space-y-2">
              <label className={labelCls}>장소 *</label>
              <Input name="location" type="text" placeholder="예: 강남구 역삼동 체육관" required />
            </div>

            {/* 날짜 및 시간 */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col space-y-2">
                <label className={labelCls}>날짜 *</label>
                <Input name="date" type="date" required />
              </div>
              <div className="flex flex-col space-y-2">
                <label className={labelCls}>시간 *</label>
                <Input name="time" type="time" required />
              </div>
            </div>

            {/* 인원 및 기준 */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col space-y-2">
                <label className={labelCls}>모집 인원 *</label>
                <Input name="maxParticipants" type="number" placeholder="예: 6" required />
              </div>
              <div className="flex flex-col space-y-2">
                <label className={labelCls}>실력 기준 *</label>
                <DropBox name="level" value={level} onChange={setLevel} options={levelOption} required />
              </div>
            </div>

            {/* 준비물 */}
            <div className="flex flex-col space-y-2">
              <label className={labelCls}>준비물</label>
              <Input name="equipment" type="text" placeholder="예: 라켓(대여 가능), 운동화" />
            </div>

            {/* 참가비 */}
            <div className="flex flex-col space-y-2">
              <label className={labelCls}>참가비</label>
              <Input name="fee" type="text" placeholder="예: 15,000원 (시설비 포함)" />
            </div>

            {/* 버튼 */}
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" fullWidth>취소</Button>
              <Button type="submit" variant="hero" fullWidth disabled={loading}>
                {loading ? '등록 중…' : '모임 만들기'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}
