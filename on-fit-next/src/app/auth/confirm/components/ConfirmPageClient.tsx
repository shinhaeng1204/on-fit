'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { sbClient } from '@/lib/supabase-client'
import { mutate } from 'swr'

export default function ConfirmPageClient() {
  const router = useRouter()
  const sp = useSearchParams()

  const code = sp.get('code')

  useEffect(() => {
    ;(async () => {
      try {
        if (code) {
          const { error } = await sbClient.auth.exchangeCodeForSession(code)
        }

        const { data: { session } } = await sbClient.auth.getSession()

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
          });
          await mutate('/api/auth/me')
        }
      } finally {
        router.replace('/auth/check')
      }
    })()
  }, [code])

  return (
    <p className="p-6 text-sm text-muted-foreground">로그인 처리 중…</p>
  )
}
