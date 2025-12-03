// components/main/FitList.tsx
'use client'

import { useMemo, useState } from 'react'
import Filter, { FilterValue } from './Filter'
import FitCard from './FitCard'
import { postType } from '@/types/post'
import { SIDO_OPTIONS, getSigunguOptions } from '@/constants/korea-regions'

type Props = {
  items: postType[]
}

// ✅ 초기값은 전부 '' (빈 문자열 = 필터 안씀 + placeholder 보임)
const initialFilter: FilterValue = {
  sport: '',
  sido: '',
  sigungu: '',
  level: '',
}

export default function FitList({ items }: Props) {
  const [filter, setFilter] = useState<FilterValue>(initialFilter)

  // ✅ 종목 옵션: "전체" + 실제 종목들
  const sportsOptions = useMemo(() => {
    const set = new Set<string>()
    items.forEach((item) => {
      if (item.sport) set.add(item.sport)
    })
    return ['전체', ...Array.from(set)]
  }, [items])

  // ✅ 시/도 옵션: "전체" + SIDO_OPTIONS
  const sidoOptions = ['전체', ...SIDO_OPTIONS]

  // ✅ 시·군·구 옵션: 시/도가 없거나 "전체"면 ["전체"]만
  const sigunguOptions = useMemo(() => {
    if (!filter.sido || filter.sido === '전체') return ['전체']
    return ['전체', ...getSigunguOptions(filter.sido)]
  }, [filter.sido])

  // ✅ 실력 옵션: "전체" + 레벨들
  const levelOptions = ['전체', '브론즈', '실버', '골드']

  // ✅ '' 또는 "전체"면 필터 안 건 것으로 처리
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // location: "서울특별시 강남구 ○○체육관"
      const [itemSido, itemSigungu] = item.location.split(' ')

      const sportOk =
        !filter.sport ||                 // ''  = 필터 안씀
        filter.sport === '전체' ||       // "전체" = 필터 안씀
        item.sport === filter.sport

      const sidoOk =
        !filter.sido ||
        filter.sido === '전체' ||
        itemSido === filter.sido

      const sigunguOk =
        !filter.sigungu ||
        filter.sigungu === '전체' ||
        itemSigungu === filter.sigungu

      const levelOk =
        !filter.level ||
        filter.level === '전체' ||
        item.level === filter.level

      return sportOk && sidoOk && sigunguOk && levelOk
    })
  }, [items, filter])

  const handleReset = () => {
    setFilter(initialFilter) // ✅ 다시 placeholder 상태로 초기화
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
