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
  sport: "전체",
  sido: "전체",
  sigungu: "전체",
  level: "전체",
}

export default function FitList({ items }: Props) {
  const [filter, setFilter] = useState<FilterValue>(initialFilter)

  const sportsOptions = useMemo(() => {
    const set = new Set<string>()
    items.forEach((item) => {
      if (item.sport) set.add(item.sport)
    })
    return ["전체", ...Array.from(set)]
  }, [items])

  const sidoOptions = ["전체", ...SIDO_OPTIONS]

  const sigunguOptions = useMemo(() => {
    if (filter.sido === "전체") return ["전체"]
    return ["전체", ...getSigunguOptions(filter.sido)]
  }, [filter.sido])

  const levelOptions = ["전체", "브론즈", "실버", "골드"]

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // location: "서울특별시 강남구 ○○체육관"
      const [itemSido, itemSigungu] = item.location.split(" ")

      const sportOk =
        filter.sport === "전체" || item.sport === filter.sport

      const sidoOk =
        filter.sido === "전체" || itemSido === filter.sido

      const sigunguOk =
        filter.sigungu === "전체" || itemSigungu === filter.sigungu

      const levelOk =
        filter.level === "전체" || item.level === filter.level

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
