"use client"

import { useMemo, useState } from "react"
import Filter, { FilterValue } from "./Filter"
import FitCard from "./FitCard"
import { postType } from "@/types/post"
import { SIDO_OPTIONS, getSigunguOptions } from "@/constants/korea-regions"

type Props = {
  items: postType[]
}

const initialFilter: FilterValue = {
  sport: "종목 선택",
  sido: "시·도 선택",
  sigungu: "시·군·구 선택",
  level: "실력 선택",
}

export default function FitList({ items }: Props) {
  const [filter, setFilter] = useState<FilterValue>(initialFilter)

  const sportsOptions = useMemo(() => {
    const set = new Set<string>()
    items.forEach((item) => {
      if (item.sport) set.add(item.sport)
    })
    return ["종목 선택", ...Array.from(set)]
  }, [items])

  const sidoOptions = ["시·도 선택", ...SIDO_OPTIONS]

  const sigunguOptions = useMemo(() => {
    if (filter.sido === "시·군·구 선택") return ["시·군·구 선택"]
    return ["시·군·구 선택", ...getSigunguOptions(filter.sido)]
  }, [filter.sido])

  const levelOptions = ["실력 선택", "브론즈", "실버", "골드"]

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // location: "서울특별시 강남구 ○○체육관"
      const [itemSido, itemSigungu] = item.location.split(" ")

      const sportOk =
        filter.sport === "종목 선택" || item.sport === filter.sport

      const sidoOk =
        filter.sido === "시·도 선택" || itemSido === filter.sido

      const sigunguOk =
        filter.sigungu === "시·군·구 선택" || itemSigungu === filter.sigungu

      const levelOk =
        filter.level === "실력 선택" || item.level === filter.level

      return sportOk && sidoOk && sigunguOk && levelOk
    })
  }, [items, filter])

  const handleReset = () => {
    setFilter(initialFilter)
  }

  return (
    <>
      <Filter
        value={filter}
        onChange={setFilter}
        onReset={handleReset}
        sportsOptions={sportsOptions}
        sidoOptions={sidoOptions}
        sigunguOptions={sigunguOptions}
        levelOptions={levelOptions}
      />

      <div className="mx-5 flex flex-col gap-6 md:grid md:grid-cols-3">
        {filteredItems.map((fit) => (
          <FitCard key={fit.id} {...fit} />
        ))}
      </div>
    </>
  )
}
