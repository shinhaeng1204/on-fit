"use client"

import { useEffect, useMemo, useState } from "react"
import Filter, { FilterValue } from "./Filter"
import FitCard from "./FitCard"
import { postType } from "@/types/post"
import { SIDO_OPTIONS, getSigunguOptions } from "@/constants/korea-regions"
import { api } from "@/lib/axios"

type Props = {
  items: postType[]
}

const initialFilter: FilterValue = {
  sport: "종목 선택",
  sido: "시·도 선택",
  sigungu: "시·군·구 선택",
  level: "실력 선택",
  keyword: "",
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
  const base = (item as any).region_label ?? (item as any).location ?? ""
  const parts = base.split(" ")
  const sido = parts[0] ?? ""
  const sigungu = parts[1] ?? ""
  const dong = parts[2] ?? ""
  return { base, sido, sigungu, dong }
}

// "부산광역시" vs "부산" 정규화
function normalizeSido(name: string) {
  if (!name) return ""
  return name.replace(/(특별시|광역시|특별자치시|특별자치도|자치시|도)$/g, "")
}

export default function FitList({ items }: Props) {
  const [filter, setFilter] = useState<FilterValue>(initialFilter)

  // 검색 모드(탭) ON/OFF
  const [searchTriggered, setSearchTriggered] = useState(false)

  // 나의 동네 모드(탭) ON/OFF
  const [useMyTown, setUseMyTown] = useState(false)

  // 내 현재 위치
  const [myLat, setMyLat] = useState<number | null>(null)
  const [myLng, setMyLng] = useState<number | null>(null)

  // 내 집(프로필) 위치
  const [homeLat, setHomeLat] = useState<number | null>(null)
  const [homeLng, setHomeLng] = useState<number | null>(null)

  // 마감 지난 글 제거
  const validItems = useMemo(() => {
    const now = new Date()

    return items.filter((item) => {
      if (!(item as any).date_time) return true

      const deadline = new Date((item as any).date_time)
      if (Number.isNaN(deadline.getTime())) return true

      return deadline >= now
    })
  }, [items])

  // 현재 위치 가져오기
  useEffect(() => {
    if (!navigator.geolocation) return

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setMyLat(coords.latitude)
        setMyLng(coords.longitude)
      },
      () => {
        setMyLat(null)
        setMyLng(null)
      }
    )
  }, [])


  // 나의 동네(집 좌표) 가져오기
  useEffect(() => {
    ;(async () => {
      try {
        const res = await api.get("/api/profile/me")
        const profile = res.data.item ?? res.data.profile ?? res.data

        setHomeLat(profile.home_lat)
        setHomeLng(profile.home_lng)
      } catch (e) {
        console.error("나의 동네 좌표 가져오기 실패", e)
      }
    })()
  }, [])

  const sportsOptions = useMemo(() => {
    const set = new Set<string>()
    items.forEach((item) => {
      if ((item as any).sport) set.add((item as any).sport)
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

    
    // 1) 검색 모드가 켜져있으면: 전국 기반(반경/지역 무시) + (검색어 없으면 전체)
    if (searchTriggered) {
      const keywordLower = filter.keyword.trim().toLowerCase()

      if (keywordLower === "") {
        return validItems
      }

      return validItems.filter((item) => {
        const title = String((item as any).title ?? "").toLowerCase()
        const keywordOk = title.includes(keywordLower)

        const sportOk =
          filter.sport === "종목 선택" || (item as any).sport === filter.sport

        const levelOk =
          filter.level === "실력 선택" || (item as any).level === filter.level

        const { sido: itemSido, sigungu: itemSigungu } = getRegionParts(item)
        const sidoOk = filter.sido === "시·도 선택" || filter.sido === itemSido
        const sigunguOk =
          filter.sigungu === "시·군·구 선택" || filter.sigungu === itemSigungu

        return keywordOk && sportOk && levelOk && sidoOk && sigunguOk
      })
    }

    // 2) (검색 모드가 아니더라도) 키워드가 입력돼있으면: 전국 제목 검색(위치/필터 무시)
    const keywordLower = filter.keyword.trim().toLowerCase()
    if (keywordLower !== "") {
      return validItems.filter((item) =>
        String((item as any).title ?? "").toLowerCase().includes(keywordLower)
      )
    }

    // 3) 지역 필터 적용 여부
    const hasSidoFilter = filter.sido !== "시·도 선택"
    const hasSigunguFilter =
      !!filter.sigungu &&
      filter.sigungu !== "시·군·구 선택" &&
      filter.sigungu !== "전체"

    const hasRegionFilter = hasSidoFilter || hasSigunguFilter

    // 4) 반경 모드 가능 여부
    const canUseRadius = !hasRegionFilter && myLat != null && myLng != null
    const canUseRadiusFromHome =
      !hasRegionFilter && useMyTown && homeLat != null && homeLng != null

    // 5) 최종 필터
    return validItems.filter((item) => {
      const { sido: rawSido, sigungu: rawSigungu } = getRegionParts(item)

      const itemSidoNorm = normalizeSido(rawSido)
      const filterSidoNorm = normalizeSido(filter.sido)

      const sportOk =
        filter.sport === "종목 선택" || (item as any).sport === filter.sport

      const levelOk =
        filter.level === "실력 선택" || (item as any).level === filter.level

      const sidoOk = !hasSidoFilter || itemSidoNorm === filterSidoNorm
      const sigunguOk = !hasSigunguFilter || rawSigungu === filter.sigungu

      // (A) 지역 필터 모드
      if (hasRegionFilter) {
        return sportOk && levelOk && sidoOk && sigunguOk
      }

      // (B) 나의 동네 반경 모드
      if (canUseRadiusFromHome) {
        const lat = (item as any).latitude
        const lng = (item as any).longitude
        if (lat == null || lng == null) return false

        const d = getDistanceKm(homeLat!, homeLng!, lat, lng)
        return sportOk && levelOk && d <= RADIUS_KM
      }

      // (C) 현재 위치 반경 모드
      if (canUseRadius) {
        const lat = (item as any).latitude
        const lng = (item as any).longitude
        if (lat == null || lng == null) return false

        const d = getDistanceKm(myLat!, myLng!, lat, lng)
        return sportOk && levelOk && d <= RADIUS_KM
      }

      // (D) 기본 모드(위치 못 받은 상태 등): sport/level만 적용
      return sportOk && levelOk
    })
  }, [validItems, filter, myLat, myLng, searchTriggered, homeLat, homeLng, useMyTown])

  const handleReset = () => {
    setFilter(initialFilter)
  }

  return (
    <>
      <Filter
        value={filter}
        onChange={(v) => {
          // 검색 모드가 켜져있더라도 값 바꾸면 검색모드 종료(정책 유지)
          setSearchTriggered(false)
          setFilter(v)
        }}
        onReset={() => {
          setSearchTriggered(false)
          handleReset()
        }}
        sportsOptions={sportsOptions}
        sidoOptions={sidoOptions}
        sigunguOptions={sigunguOptions}
        levelOptions={levelOptions}
        onSearch={(active) => setSearchTriggered(active)}
        onMyTownToggle={(active) => {
          setUseMyTown(active)
          if (active) setSearchTriggered(false)
        }}
      />

      <div className="mx-5 flex flex-col gap-6 md:grid md:grid-cols-3">
        {filteredItems.map((fit) => (
          <FitCard key={(fit as any).id} {...fit} />
        ))}
      </div>
    </>
  )
}
