'use client'

import { useEffect, useRef, useState } from 'react'
import useKakaoLoader from '@/hooks/useKakaoLoader'

type Props = {
  appKey: string
  onPick?: (payload: {lat: number; lng: number; region: string}) => void
}

function formatSido(sido: string) {
  if (/(특별시|광역시|특별자치시|특별자치도|도|시)$/.test(sido)) return sido
  const metro = ['서울', '부산', '대구', '인천', '광주', '대전', '울산', '세종']
  if (metro.includes(sido)) return sido === '세종' ? '세종특별자치시' : `${sido}시`
  return `${sido}도`
}

function pickGuLabel(res: any[]) {
  const target = res.find((r: any) => r.region_type === 'H') ?? res[0]
  const { region_1depth_name: sidoRaw, region_2depth_name: guRaw } = target
  const sido = formatSido(sidoRaw)
  const gu = guRaw || ''
  return gu ? `${sido} ${gu}` : sido
}

export default function LocationPicker({ appKey, onPick }: Props) {
  const ready = useKakaoLoader(appKey)
  const boxRef = useRef<HTMLDivElement | null>(null)

  const [map, setMap] = useState<any>(null)
  const [marker, setMarker] = useState<any>(null)
  const [label, setLabel] = useState<string>('위치 불러오는 중...')

  useEffect(() => {
    if (!ready || !boxRef.current || map) return

    const kakao = (window as any).kakao

    // 1️⃣ dummy center 로 지도 생성
    const dummyCenter = new kakao.maps.LatLng(0, 0)
    const _map = new kakao.maps.Map(boxRef.current, {
      center: dummyCenter,
      level: 7, // 반경 10km가 한 눈에 보이도록 살짝 줌 아웃
    })

    // 2️⃣ 마커 (처음엔 숨김)
    const _marker = new kakao.maps.Marker({ position: dummyCenter })
    _marker.setMap(null)

    setMap(_map)
    setMarker(_marker)

    // 3️⃣ geolocation → 내 위치 + 반경 10km 원
    if (navigator.geolocation) {
      const geocoder = new kakao.maps.services.Geocoder()

      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          const {latitude, longitude} = coords
          const latlng = new kakao.maps.LatLng(coords.latitude, coords.longitude)

          // 지도 & 마커 갱신
          _map.setCenter(latlng)
          _marker.setPosition(latlng)
          _marker.setMap(_map)

          // 🔵 반경 5km 원 오버레이
          const circle = new kakao.maps.Circle({
            center: latlng,
            radius: 5000, // 10km = 10,000m
            strokeWeight: 2,
            strokeColor: '#3182F6',
            strokeOpacity: 0.8,
            strokeStyle: 'solid',
            fillColor: '#3182F6',
            fillOpacity: 0.15,
          })
          circle.setMap(_map)

          // 역지오코딩 → label 업데이트
          geocoder.coord2RegionCode(
            latlng.getLng(),
            latlng.getLat(),
            (res: any, status: any) => {
              if (status === kakao.maps.services.Status.OK && res[0]) {
                const region = pickGuLabel(res)
                setLabel(`현재 위치 (반경 10km): ${region}`)

                onPick?.({
                  lat: latitude,
                  lng: longitude,
                  region,
                })
              }
            }
          )
        },
        () => {
          // 위치 권한 거부 → fallback
          const fallback = new kakao.maps.LatLng(37.5665, 126.9780) // 서울시청

          _map.setCenter(fallback)
          _marker.setPosition(fallback)
          _marker.setMap(_map)

          // 서울시청 기준 5km 원 (권한 거부 시에도 UX 유지)
          const circle = new kakao.maps.Circle({
            center: fallback,
            radius: 5000,
            strokeWeight: 2,
            strokeColor: '#3182F6',
            strokeOpacity: 0.8,
            strokeStyle: 'solid',
            fillColor: '#3182F6',
            fillOpacity: 0.15,
          })
          circle.setMap(_map)

          setLabel('현재 위치를 불러올 수 없습니다. (기본 위치 기준 반경 10km)')
        }
      )
    }
  }, [ready, map, onPick])

  return (
    <div className="space-y-2">
      <div
        ref={boxRef}
        className="h-96 w-full rounded-xl border overflow-hidden"
      />
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  )
}
