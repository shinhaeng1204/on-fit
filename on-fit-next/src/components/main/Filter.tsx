// components/main/Filter.tsx
'use client'

import { Card, CardContent, CardHeader } from "../common/Card"
import {Funnel, X } from "lucide-react"
import DropBox from "../common/DropBox"
import { Button } from "../common/Button"

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
    // 시/도가 바뀌면 구/군은 전체로 초기화
    onChange({ ...value, sido: next, sigungu: "전체" })
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

          <Button
            variant="ghost"
            size="sm"
            className="max-h-0 text-xs"
            onClick={handleReset}
          >
            <div className="flex">
              <X/>
            <h3>초기화</h3>
            </div>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pb-3 md:py-4">
        <div className="grid grid-cols-2 gap-3 md:flex md:gap-4">
          {/* 종목 */}
          <div className="flex flex-col gap-1 min-w-[120px]">
            <span className="text-xs text-muted-foreground">종목</span>
            <DropBox
              defaultValue="전체"
              options={sportsOptions}
              value={sport}
              onChange={handleSportChange}
            />
          </div>

          {/* 실력 */}
          <div className="flex flex-col gap-1 min-w-[120px]">
            <span className="text-xs text-muted-foreground">실력</span>
            <DropBox
              defaultValue="전체"
              options={levelOptions}
              value={level}
              onChange={handleLevelChange}
            />
          </div>

          {/* 시/도 */}
          <div className="flex flex-col gap-1 min-w-[120px]">
            <span className="text-xs text-muted-foreground">시 / 도</span>
            <DropBox
              defaultValue="전체"
              options={sidoOptions}
              value={sido}
              onChange={handleSidoChange}
            />
          </div>

          {/* 시·군·구 */}
          <div className="flex flex-col gap-1 min-w-[120px]">
            <span className="text-xs text-muted-foreground">시·군·구</span>
            <DropBox
              defaultValue="전체"
              options={sigunguOptions}
              value={sigungu}
              onChange={handleSigunguChange}
            />
          </div>

          
        </div>
      </CardContent>
    </Card>
  )
}
