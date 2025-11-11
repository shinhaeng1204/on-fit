// app/auth/confirm/page.tsx
'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { sbClient } from '@/lib/supabase-client'
import { mutate } from 'swr'

export default function ConfirmPage() {
  const router = useRouter()
  const sp = useSearchParams()

  useEffect(() => {
    ;(async () => {
      try {
        // 1) PKCE로 돌아오면 ?code=... 이 붙어있음 → 클라에서 교환
        const code = sp.get('code')
        if (code) {
          const { error } = await sbClient.auth.exchangeCodeForSession(code)
          // error가 있어도 아래 단계로 진행(implicit 대비)
        }

        // 2) 어떤 플로우든 현재 세션을 가져온다
        const { data: { session } } = await sbClient.auth.getSession()

        // 3) 세션이 있으면 서버에 전달 → HttpOnly 쿠키로 교체
        if (session) {
          await fetch('/api/auth/cookie', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              access_token: session.access_token,
              refresh_token: session.refresh_token,
              expires_at: session.expires_at,
            }),
          })
          // 헤더 즉시 반영
          await mutate('/api/auth/me')
        }
      } finally {
        router.replace('/auth/check')
      }
    })()
  }, [router, sp])

  return <p className="p-6 text-sm text-muted-foreground">로그인 처리 중…</p>
}
