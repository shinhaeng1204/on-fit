// components/main/Filter.tsx
'use client'

import { Card, CardContent, CardHeader } from "../common/Card"
import { Funnel } from "lucide-react"
import DropBox from "../common/DropBox"
import { Button } from "../common/Button"

export type FilterValue = {
  sport: string
  location: string
  level: string
}

type FilterProps = {
  value: FilterValue
  onChange: (value: FilterValue) => void
  onReset?: () => void
  sportsOptions: string[]
  locationOptions: string[]
  levelOptions: string[]
}

export default function Filter({
  value,
  onChange,
  onReset,
  sportsOptions,
  locationOptions,
  levelOptions,
}: FilterProps) {
  const { sport, location, level } = value

  const handleSportChange = (next: string) => {
    onChange({ ...value, sport: next })
  }

  const handleLocationChange = (next: string) => {
    onChange({ ...value, location: next })
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
            초기화
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pb-3 md:py-4">
        <div className="grid grid-cols-2 gap-2 md:flex md:gap-3">
          <DropBox
            defaultValue="종목 선택"
            options={sportsOptions}
            value={sport}
            onChange={handleSportChange}
          />
          <DropBox
            defaultValue="지역 선택"
            options={locationOptions}
            value={location}
            onChange={handleLocationChange}
          />
          <DropBox
            defaultValue="실력 선택"
            options={levelOptions}
            value={level}
            onChange={handleLevelChange}
          />
        </div>
      </CardContent>
    </Card>
  )
}
