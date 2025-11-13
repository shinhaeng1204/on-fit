// app/auth/reset/page.tsx
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { sbClient } from '@/lib/supabase-client'
import { mutate } from 'swr'

export default function ResetBridge() {
  const router = useRouter()

  useEffect(() => {
    (async () => {
      // URL 해시에서 토큰 꺼내기
      const hash = window.location.hash.startsWith('#')
        ? window.location.hash.slice(1)
        : window.location.hash
      const h = new URLSearchParams(hash)
      const access_token = h.get('access_token') || ''
      const refresh_token = h.get('refresh_token') || ''
      const expires_in = Number(h.get('expires_in') || '3600')

      if (!access_token || !refresh_token) {
        router.replace('/auth?tab=login&error=reset_token_missing')
        return
      }

      // 1) 클라 세션 세팅
      const { error: setErr } = await sbClient.auth.setSession({
        access_token,
        refresh_token,
      })
      // setSession 실패해도 아래 단계로 시도
      // 2) 서버(HttpOnly 쿠키)로 교체
      const expires_at = Math.floor(Date.now() / 1000) + expires_in
      await fetch('/api/auth/cookie', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ access_token, refresh_token, expires_at }),
      }).catch(() => {})

      // SWR 세션 즉시 반영(사용 중이면)
      await mutate('/api/auth/me')

      // 3) 새 비번 입력 화면으로 이동
      router.replace('/auth/new-password')
    })()
  }, [router])

  return <p className="p-6 text-sm text-muted-foreground">토큰 확인 중…</p>
}