'use client'

import { useEffect, useState } from "react";

export default function useKakaoLoader(appKey: string) {
    const [ready, setReady] = useState(false)

    useEffect (() => {
        if(typeof window === 'undefined') return;
        // 이미 로드됨
        if(window.kakao && window.kakao.maps) {
            setReady(true)
            return
        }

        // 스크립트
        const script = document.createElement('script')
        script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&libraries=services&autoload=false`
        script.async = true
        script.onload = () => {
            // SDK 내부 리소스 로드 보장
            window.kakao.maps.load(() => setReady(true))
        }
        document.head.appendChild(script)
        return() => {

        }
    }, [appKey])
    return ready
}