'use client'

import { useEffect, useRef, useState } from 'react'
import  useKakaoLoader  from '@/hooks/useKakaoLoader'

type Props = {
  appKey: string
  open: boolean
  onPick: (payload: { lat: number; lng: number; region: string }) => void
}

/** 시/도 보정: '서울' → '서울시', '경기' → '경기도', '세종' → '세종특별자치시' */
function formatSido(sido: string) {
  if (/(특별시|광역시|특별자치시|특별자치도|도|시)$/.test(sido)) return sido
  const metro = ['서울', '부산', '대구', '인천', '광주', '대전', '울산', '세종']
  if (metro.includes(sido)) return sido === '세종' ? '세종특별자치시' : `${sido}시`
  return `${sido}도`
}

/** H(행정동) 우선 → "서울시 동작구" 같은 라벨 반환 */
function pickGuLabel(res: any[]) {
  const target = res.find((r: any) => r.region_type === 'H') ?? res[0]
  const { region_1depth_name: sidoRaw, region_2depth_name: guRaw } = target
  const sido = formatSido(sidoRaw || '')
  const gu = guRaw || ''
  return gu ? `${sido} ${gu}` : `${sido}`
}

export default function LocationPicker({ appKey, open, onPick }: Props) {
  const ready = useKakaoLoader(appKey)
  const boxRef = useRef<HTMLDivElement | null>(null)
  const [map, setMap] = useState<any>(null)
  const [marker, setMarker] = useState<any>(null)
  const [label, setLabel] = useState<string>('')

  // 모달 열림 + SDK 준비 → 지도 생성
  useEffect(() => {
    if (!open || !ready || !boxRef.current || map) return
    const kakao = (window as any).kakao
    const center = new kakao.maps.LatLng(37.5665, 126.9780) // 서울시청
    const _map = new kakao.maps.Map(boxRef.current, { center, level: 5 })
    const _marker = new kakao.maps.Marker({ position: center })
    _marker.setMap(_map)
    setMap(_map)
    setMarker(_marker)
  }, [open, ready, map])

  // 열릴 때 레이아웃 보정
  useEffect(() => {
    if (!open || !map) return
    const id = setTimeout(() => {
      map.relayout()
      map.setCenter(map.getCenter())
    }, 0)
    return () => clearTimeout(id)
  }, [open, map])

  // 지도 클릭 → 역지오코딩
  useEffect(() => {
    if (!map || !marker) return
    const kakao = (window as any).kakao
    const geocoder = new kakao.maps.services.Geocoder()

    const clickHandler = (e: any) => {
      const latlng = e.latLng
      marker.setPosition(latlng)
      map.panTo(latlng)
      geocoder.coord2RegionCode(
        latlng.getLng(),
        latlng.getLat(),
        (res: any, status: any) => {
          if (status === kakao.maps.services.Status.OK && res[0]) {
            setLabel(pickGuLabel(res)) // ✅ "서울시 동작구"
          }
        }
      )
    }

    kakao.maps.event.addListener(map, 'click', clickHandler)
    return () => kakao.maps.event.removeListener(map, 'click', clickHandler)
  }, [map, marker])

  // 현재 위치 버튼
  const useCurrentLocation = () => {
    if (!map || !marker) return
    if (!navigator.geolocation) return alert('브라우저에서 위치를 지원하지 않아요.')
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const kakao = (window as any).kakao
        const geocoder = new kakao.maps.services.Geocoder()
        const latlng = new kakao.maps.LatLng(coords.latitude, coords.longitude)
        marker.setPosition(latlng)
        map.setCenter(latlng)
        geocoder.coord2RegionCode(
          latlng.getLng(),
          latlng.getLat(),
          (res: any, status: any) => {
            if (status === kakao.maps.services.Status.OK && res[0]) {
              setLabel(pickGuLabel(res)) // ✅ "서울시 동작구"
            }
          }
        )
      },
      () => alert('현재 위치 권한을 허용해 주세요.')
    )
  }

  const confirm = () => {
    if (!marker) return
    const pos = marker.getPosition()
    onPick({ lat: pos.getLat(), lng: pos.getLng(), region: label })
  }

  return (
    <div className="space-y-3">
      <div ref={boxRef} className="h-72 w-full rounded-xl border overflow-hidden" />
      <div className="flex items-center justify-between text-sm">
        <div className="text-muted-foreground">
          {label ? `선택된 지역: ${label}` : '지도를 클릭하거나 현재 위치를 사용하세요'}
        </div>
        <div className="flex gap-2">
          <button className="h-9 rounded-md border px-3" onClick={useCurrentLocation}>
            현재 위치
          </button>
          <button
            className="h-9 rounded-md bg-primary px-3 text-primary-foreground disabled:opacity-50"
            disabled={!label}
            onClick={confirm}
          >
            선택
          </button>
        </div>
      </div>
    </div>
  )
}
