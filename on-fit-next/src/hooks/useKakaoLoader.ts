// hooks/useKakaoLoader.ts
'use client'

import { useEffect, useState } from 'react'

export default function useKakaoLoader() {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    // 이미 로드되어 있는 경우
    if (window.kakao && window.kakao.maps) {
      if (window.kakao.maps.load) {
        window.kakao.maps.load(() => setReady(true))
      } else {
        setReady(true)
      }
      return
    }

    // 아직이면 일정 간격으로 체크
    const id = setInterval(() => {
      if (window.kakao && window.kakao.maps) {
        if (window.kakao.maps.load) {
          window.kakao.maps.load(() => setReady(true))
        } else {
          setReady(true)
        }
        clearInterval(id)
      }
    }, 100)

    return () => clearInterval(id)
  }, [])

  return ready
}
