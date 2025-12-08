"use client"

import { useEffect, useMemo, useState } from "react"
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

// 거리 계산 (하버사인)
const R = 6371 // 지구 반지름 (km)
function deg2rad(deg: number) {
  return (deg * Math.PI) / 180
}
function getDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const dLat = deg2rad(lat2 - lat1)
  const dLng = deg2rad(lng2 - lng1)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

const RADIUS_KM = 5 // 기본 반경 5km

// region_label 또는 location에서 시/도, 시군구, 동 뽑기
function getRegionParts(item: postType) {
  const base = item.region_label ?? item.location ?? ""
  const parts = base.split(" ")
  const sido = parts[0] ?? ""      // 부산광역시
  const sigungu = parts[1] ?? ""   // 남구
  const dong = parts[2] ?? ""      // 안락2동 (있으면)
  return { base, sido, sigungu, dong }
}

// "부산광역시" vs "부산" 정규화
function normalizeSido(name: string) {
  if (!name) return ""
  return name.replace(/(특별시|광역시|특별자치시|특별자치도|자치시|도)$/g, "")
}

export default function FitList({ items }: Props) {
  const [filter, setFilter] = useState<FilterValue>(initialFilter)

  // 내 위치 상태
  const [myLat, setMyLat] = useState<number | null>(null)
  const [myLng, setMyLng] = useState<number | null>(null)

  useEffect(() => {
    if (!navigator.geolocation) return

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
       
        setMyLat(coords.latitude)
        setMyLng(coords.longitude)
      },
      (err) => {
        setMyLat(null)
        setMyLng(null)
      }
    )
  }, [])

  useEffect(() => {
  }, [myLat, myLng])

  const sportsOptions = useMemo(() => {
    const set = new Set<string>()
    items.forEach((item) => {
      if (item.sport) set.add(item.sport)
    })
    return ["종목 선택", ...Array.from(set)]
  }, [items])

  const sidoOptions = ["시·도 선택", ...SIDO_OPTIONS]

  const sigunguOptions = useMemo(() => {
    if (filter.sido === "시·도 선택") return ["시·군·구 선택", "전체"]
    return ["시·군·구 선택", "전체", ...getSigunguOptions(filter.sido)]
  }, [filter.sido])

  const levelOptions = ["실력 선택", "브론즈", "실버", "골드"]

  const filteredItems = useMemo(() => {
    const hasSidoFilter = filter.sido !== "시·도 선택"

    // 값이 비어있으면(falsey) 필터 OFF 로 간주
    const hasSigunguFilter =
      !!filter.sigungu &&
      filter.sigungu !== "시·군·구 선택" &&
      filter.sigungu !== "전체"

    const hasRegionFilter = hasSidoFilter || hasSigunguFilter
    const canUseRadius =
      !hasRegionFilter && myLat != null && myLng != null

    console.log("🔍 필터 상태", {
      filter,
      hasSidoFilter,
      hasSigunguFilter,
      hasRegionFilter,
      canUseRadius,
      myLat,
      myLng,
    })

    const result = items.filter((item) => {
      const { base, sido: rawSido, sigungu: rawSigungu, dong } =
        getRegionParts(item)

      const itemSidoNorm = normalizeSido(rawSido)
      const filterSidoNorm = normalizeSido(filter.sido)

      const sportOk =
        filter.sport === "종목 선택" || item.sport === filter.sport

      const levelOk =
        filter.level === "실력 선택" || item.level === filter.level

      const sidoOk =
        !hasSidoFilter || itemSidoNorm === filterSidoNorm

      const sigunguOk =
        !hasSigunguFilter || rawSigungu === filter.sigungu

      console.log("🏷 게시글", {
        id: item.id,
        title: item.title,
        location: item.location,
        region_label: item.region_label,
        parsed: { base, rawSido, rawSigungu, dong },
        normalized: { itemSidoNorm, filterSidoNorm },
        coords: { latitude: item.latitude, longitude: item.longitude },
      })

      // 지역 필터 모드
      if (hasRegionFilter) {
        const pass = sportOk && levelOk && sidoOk && sigunguOk
        
        return pass
      }

      // 반경 필터 모드
      if (canUseRadius) {
        if (item.latitude == null || item.longitude == null) {
          
          return false
        }

        const d = getDistanceKm(myLat!, myLng!, item.latitude, item.longitude)
        const distanceOk = d <= RADIUS_KM


        return sportOk && levelOk && distanceOk
      }

      // 기본 모드
      const pass = sportOk && levelOk
      
      return pass
    })

    
    return result
  }, [items, filter, myLat, myLng])

  useEffect(() => {

  }, [filteredItems])

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
