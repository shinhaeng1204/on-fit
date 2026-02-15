'use client'

import { useEffect, useRef, useState } from 'react'
import useKakaoLoader from '@/hooks/useKakaoLoader'

type Props = {
  onPick?: (payload: { lat: number; lng: number; region: string }) => void
}

// 시/도 이름 포맷팅
function formatSido(sido: string) {
  if (/(특별시|광역시|특별자치시|특별자치도|도|시)$/.test(sido)) return sido
  const metro = ['서울', '부산', '대구', '인천', '광주', '대전', '울산', '세종']
  if (metro.includes(sido)) return sido === '세종' ? '세종특별자치시' : `${sido}시`
  return `${sido}도`
}

// 시/도 + 시/군/구 + 동 라벨 생성
function pickRegionLabel(res: any[]) {
  const target = res.find((r: any) => r.region_type === 'H') ?? res[0]
  const {
    region_1depth_name: sidoRaw,
    region_2depth_name: guRaw,
    region_3depth_name: dongRaw,
  } = target

  const sido = formatSido(sidoRaw)
  const gu = guRaw || ''
  const dong = dongRaw || ''

  if (gu && dong) return `${sido} ${gu} ${dong}`
  if (gu) return `${sido} ${gu}`
  return sido
}

export default function LocationViewer({ onPick }: Props) {
  const ready = useKakaoLoader()
  const boxRef = useRef<HTMLDivElement | null>(null)

  const [map, setMap] = useState<any>(null)
  const [marker, setMarker] = useState<any>(null)
  const [label, setLabel] = useState('위치 불러오는 중...')

  // 반경 원 ref (나중에 필요하면 지우려고)
  const circleRef = useRef<any>(null)

  useEffect(() => {
    if (!ready || !boxRef.current || map) return

    const kakao = (window as any).kakao

    // ✅ 초기 중심: 서울시청
    const defaultCenter = new kakao.maps.LatLng(37.5665, 126.9780)
    const _map = new kakao.maps.Map(boxRef.current, {
      center: defaultCenter,
      level: 8,
    })

    const _marker = new kakao.maps.Marker({
      position: defaultCenter,
    })
    _marker.setMap(null)

    setMap(_map)
    setMarker(_marker)

    const geocoder = new kakao.maps.services.Geocoder()

    // ✅ 내 위치 기준 초기 세팅
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          const { latitude, longitude } = coords
          const latlng = new kakao.maps.LatLng(latitude, longitude)

          _map.setCenter(latlng)
          _marker.setPosition(latlng)
          _marker.setMap(_map)

          // 반경 5km 원
          const circle = new kakao.maps.Circle({
            center: latlng,
            radius: 5000,
            strokeWeight: 2,
            strokeColor: '#3182F6',
            strokeOpacity: 0.8,
            strokeStyle: 'solid',
            fillColor: '#3182F6',
            fillOpacity: 0.15,
          })
          circle.setMap(_map)
          circleRef.current = circle

          // 역지오코딩 → 라벨 + onPick
          geocoder.coord2RegionCode(
            latlng.getLng(),
            latlng.getLat(),
            (res: any[], status: any) => {
              if (status === kakao.maps.services.Status.OK && res[0]) {
                const region = pickRegionLabel(res)
                setLabel(`현재 위치 (반경 5km): ${region}`)

                onPick?.({
                  lat: latitude,
                  lng: longitude,
                  region,
                })
              } else {
                setLabel('현재 위치 정보를 불러올 수 없습니다.')
              }
            }
          )
        },
        () => {
          // 위치 권한 거부 → 서울시청 fallback
          const fallback = new kakao.maps.LatLng(37.5665, 126.9780)

          _map.setCenter(fallback)
          _marker.setPosition(fallback)
          _marker.setMap(_map)

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
          circleRef.current = circle

          setLabel('현재 위치를 불러올 수 없습니다. (기본 위치 기준 반경 5km)')
        }
      )
    } else {
      // geolocation 자체 미지원인 경우
      const fallback = new kakao.maps.LatLng(37.5665, 126.9780)

      _map.setCenter(fallback)
      _marker.setPosition(fallback)
      _marker.setMap(_map)

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
      circleRef.current = circle

      setLabel('현재 위치 기능을 사용할 수 없습니다. (기본 위치 기준 반경 5km)')
    }

    return () => {
      if (circleRef.current) {
        circleRef.current.setMap(null)
      }
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
