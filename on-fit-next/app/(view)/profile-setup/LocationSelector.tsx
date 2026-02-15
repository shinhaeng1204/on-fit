'use client'

import React, {
  useEffect,
  useRef,
  useState,
  KeyboardEventHandler,
} from 'react'
import useKakaoLoader from '@/hooks/useKakaoLoader'

// 시/도 이름 포맷팅
function formatSido(sido: string) {
  if (/(특별시|광역시|특별자치시|특별자치도|도|시)$/.test(sido)) return sido
  const metro = ['서울', '부산', '대구', '인천', '광주', '대전', '울산', '세종']
  if (metro.includes(sido))
    return sido === '세종' ? '세종특별자치시' : `${sido}시`
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

// Kakao Places 검색 결과 타입 (필요한 필드만)
type KakaoPlace = {
  id: string
  place_name: string
  address_name: string
  road_address_name: string
  x: string // lng
  y: string // lat
  place_url: string
}

type Props = {
  onPick?: (payload: { lat: number; lng: number; region: string }) => void
}

export default function LocationSelector({ onPick }: Props) {
  const ready = useKakaoLoader()
  const boxRef = useRef<HTMLDivElement | null>(null)

  const [map, setMap] = useState<any>(null)
  const [marker, setMarker] = useState<any>(null)
  const [label, setLabel] = useState('위치 불러오는 중...')
  const [query, setQuery] = useState('')

  // 반경 5km 원
  const circleRef = useRef<any>(null)

  // 상단 드롭다운 검색 결과
  const [searchResults, setSearchResults] = useState<KakaoPlace[]>([])
  const [isSearching, setIsSearching] = useState(false)

  useEffect(() => {
    if (!ready || !boxRef.current || map) return

    const kakao = (window as any).kakao

    // 지도 생성 (초기값: 서울시청)
    const defaultCenter = new kakao.maps.LatLng(37.5665, 126.9780)
    const _map = new kakao.maps.Map(boxRef.current, {
      center: defaultCenter,
      level: 7,
    })

    // 마커 생성 (처음엔 숨김)
    const _marker = new kakao.maps.Marker({
      position: defaultCenter,
    })
    _marker.setMap(null)

    setMap(_map)
    setMarker(_marker)

    const geocoder = new kakao.maps.services.Geocoder()

    // 내 위치 기준 초기 세팅
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
          // 권한 거부 시 서울시청 기준
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

          setLabel(
            '현재 위치를 불러올 수 없습니다. (기본 위치 기준 반경 5km)'
          )
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

      setLabel(
        '현재 위치 기능을 사용할 수 없습니다. (기본 위치 기준 반경 5km)'
      )
    }

    // 지도 클릭하면: 그 위치로 핀 + 원 이동 + 라벨 갱신
    const clickHandler = (mouseEvent: any) => {
      const latlng = mouseEvent.latLng
      const lat = latlng.getLat()
      const lng = latlng.getLng()

      _map.setCenter(latlng)
      _marker.setPosition(latlng)
      _marker.setMap(_map)

      // 기존 원 제거 후 새 원 생성
      if (circleRef.current) {
        circleRef.current.setMap(null)
      }
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

      // 역지오코딩
      geocoder.coord2RegionCode(
        lng,
        lat,
        (res: any[], status: any) => {
          if (status === kakao.maps.services.Status.OK && res[0]) {
            const region = pickRegionLabel(res)
            setLabel(`선택 위치 (반경 5km): ${region}`)

            onPick?.({
              lat,
              lng,
              region,
            })
          } else {
            setLabel('선택한 위치 정보를 불러올 수 없습니다.')
          }
        }
      )

      // 지도를 직접 클릭하면 검색 리스트는 닫기
      setSearchResults([])
    }

    kakao.maps.event.addListener(_map, 'click', clickHandler)

    // cleanup
    return () => {
      kakao.maps.event.removeListener(_map, 'click', clickHandler)
    }
  }, [ready, map, onPick])

  //  지도/마커/원 + 라벨 + onPick 공통 적용 함수
  const applyLocation = (lat: number, lng: number, labelPrefix: string) => {
    if (!map || !marker) return
    const kakao = (window as any).kakao
    const geocoder = new kakao.maps.services.Geocoder()
    const latlng = new kakao.maps.LatLng(lat, lng)

    map.setCenter(latlng)
    marker.setPosition(latlng)
    marker.setMap(map)

    // 원 갱신
    if (circleRef.current) {
      circleRef.current.setMap(null)
    }
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
    circle.setMap(map)
    circleRef.current = circle

    // 역지오코딩 → 라벨 + onPick
    geocoder.coord2RegionCode(
      lng,
      lat,
      (res: any[], status: any) => {
        if (status === kakao.maps.services.Status.OK && res[0]) {
          const region = pickRegionLabel(res)
          setLabel(`${labelPrefix} (반경 5km): ${region}`)

          onPick?.({
            lat,
            lng,
            region,
          })
        } else {
          setLabel('선택한 위치 정보를 불러올 수 없습니다.')
        }
      }
    )
  }

  // Places + addressSearch 섞은 검색
  const handleSearch = () => {
    if (!map || !marker || !query.trim()) return
    const kakao = (window as any).kakao

    setIsSearching(true)
    setSearchResults([])

    const ps = new kakao.maps.services.Places()

    // 1순위: 장소명/키워드 검색
    ps.keywordSearch(query, (data: KakaoPlace[], status: any) => {
      if (status === kakao.maps.services.Status.OK && data.length > 0) {
        // 여러 개 결과 → 상단 드롭다운에 노출
        setSearchResults(data)
        setIsSearching(false)
        return
      }

      // 2순위: 주소 검색으로 fallback
      const geocoder = new kakao.maps.services.Geocoder()
      geocoder.addressSearch(query, (result: any[], addrStatus: any) => {
        setIsSearching(false)

        if (addrStatus !== kakao.maps.services.Status.OK || !result[0]) {
          setLabel('검색 결과가 없습니다.')
          return
        }

        const { x, y } = result[0]
        const lat = parseFloat(y)
        const lng = parseFloat(x)

        // 바로 위치 적용
        applyLocation(lat, lng, '검색 위치')
      })
    })
  }

  const handleKeyDown: KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSearch()
    }
  }

  // 드롭다운에서 장소 하나 선택했을 때
  const handleSelectPlace = (place: KakaoPlace) => {
    const lat = parseFloat(place.y)
    const lng = parseFloat(place.x)

    applyLocation(lat, lng, '선택한 장소')
    setSearchResults([]) // 리스트 닫기
  }

  return (
    <div className="space-y-2">
      {/*  검색 인풋 */}
      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 h-10 rounded-md border px-3 text-sm"
          placeholder="주소 또는 장소명을 입력하세요 (예: 순복음 안락교회)"
        />
        <button
          type="button"
          onClick={handleSearch}
          className="h-10 px-3 text-sm rounded-md border bg-muted"
        >
          {isSearching ? '검색중...' : '검색'}
        </button>
      </div>

      {/* 상단 드롭다운 리스트 (검색 결과) */}
      <div className="relative">
        {searchResults.length > 0 && (
          <div className="absolute left-0 right-0 top-0 z-20 max-h-56 overflow-y-auto rounded-lg border bg-background shadow-md">
            {searchResults.map((place) => (
              <button
                key={place.id}
                type="button"
                onClick={() => handleSelectPlace(place)}
                className="flex w-full flex-col gap-0.5 px-3 py-2 text-left hover:bg-muted"
              >
                <span className="text-sm font-medium">
                  {place.place_name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {place.road_address_name || place.address_name}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* 지도 박스 */}
        <div
          ref={boxRef}
          className="h-96 w-full rounded-xl border overflow-hidden"
        />
      </div>

      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  )
}
