'use client'

import { Card, CardContent, CardHeader } from '../common/Card'
import { Funnel, X } from 'lucide-react'
import DropBox from '../common/DropBox'
import { Button } from '../common/Button'

export type FilterValue = {
  sport: string
  sido: string
  sigungu: string
  level: string
}

type FilterProps = {
  value: FilterValue
  onChange: (value: FilterValue) => void
  onReset?: () => void
  sportsOptions: string[]
  sidoOptions: string[]
  sigunguOptions: string[]
  levelOptions: string[]
}

export default function Filter({
  value,
  onChange,
  onReset,
  sportsOptions,
  sidoOptions,
  sigunguOptions,
  levelOptions,
}: FilterProps) {
  const { sport, sido, sigungu, level } = value

  const handleSportChange = (next: string) => {
    onChange({ ...value, sport: next })
  }

  const handleSidoChange = (next: string) => {
    // 시/도가 바뀌면 시·군·구는 다시 선택 안한 상태로
    onChange({ ...value, sido: next, sigungu: '' })
  }

  const handleSigunguChange = (next: string) => {
    onChange({ ...value, sigungu: next })
  }

  const handleLevelChange = (next: string) => {
    onChange({ ...value, level: next })
  }

  const handleReset = () => {
    onReset?.()
  }

  return (
    <Card className="mx-5 my-4 bg-card/50 backdrop-blur-sm md:flex md:items-center">
      <CardHeader className="py-3 px-6 md:pr-0">
        <div className="flex items-center justify-between">
          <div className="flex gap-2 items-center">
            <Funnel className="text-primary w-4 h-4" />
            <h1 className="text-sm font-semibold">필터</h1>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pb-3 md:py-4">
        <div className="grid grid-cols-2 gap-3 md:flex md:items-end md:gap-4">
          {/* 종목 */}
          <div className="flex flex-col gap-1 min-w-[120px]">
            <DropBox
              options={sportsOptions}
              value={sport}
              onChange={handleSportChange}
              placeholder="종목 선택"
            />
          </div>

          {/* 지역(시/도) */}
          <div className="flex flex-col gap-1 min-w-[120px]">
            <DropBox
              options={sidoOptions}
              value={sido}
              onChange={handleSidoChange}
              placeholder="지역 선택"
            />
          </div>

          {/* 시·군·구 */}
          <div className="flex flex-col gap-1 min-w-[120px]">
            <DropBox
              options={sigunguOptions}
              value={sigungu}
              onChange={handleSigunguChange}
              placeholder="시·군·구 선택"
            />
          </div>

          {/* 실력 */}
          <div className="flex flex-col gap-1 min-w-[120px]">
            <DropBox
              options={levelOptions}
              value={level}
              onChange={handleLevelChange}
              placeholder="실력 선택"
            />
          </div>

          {/* 초기화 버튼 */}
          <div>
            <Button
              type="button"
              onClick={handleReset}
              leftIcon={<X />}
              variant="outline"
              className="w-full md:w-auto h-10"
              size="default"
            >
              초기화
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
