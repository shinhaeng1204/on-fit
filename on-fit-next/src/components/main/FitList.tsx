'use client'

import { useMemo, useState } from "react"
import Filter, { FilterValue } from "./Filter"
import FitCard from "./FitCard"
import {postType} from "@/types/post";

type Props = {
  items: postType[]
}

const initialFilter: FilterValue = {
  sport: "전체",
  location: "전체",
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

  const locationOptions = useMemo(() => {
    const set = new Set<string>()
    items.forEach((item) => {
      if (item.location) set.add(item.location)
    })
    return ["전체", ...Array.from(set)]
  }, [items])

  const levelOptions = ["전체", "브론즈", "실버", "골드"]

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const sportOk =
        !filter.sport ||
        filter.sport === "전체" ||
        item.sport === filter.sport

      const locationOk =
        !filter.location ||
        filter.location === "전체" ||
        item.location.includes(filter.location)

      const levelOk =
        !filter.level ||
        filter.level === "전체" ||
        item.level === filter.level

      return sportOk && locationOk && levelOk
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
        locationOptions={locationOptions}
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
