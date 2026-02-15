// src/hooks/useAuthSession.ts
'use client'

import useSWR from 'swr'
import { useEffect } from 'react'
import { sbClient } from '@/lib/supabase-client'
import type { Session } from '@supabase/supabase-js'

type MeResponse = { ok: boolean; user: any | null }

const fetcher = (url: string) =>
  fetch(url, { credentials: 'include' }).then((r) => r.json() as Promise<MeResponse>)

export function useAuthSession() {
  const { data, isLoading, mutate } = useSWR('/api/auth/me', fetcher, {
    revalidateOnFocus: true,
    dedupingInterval: 0,
  })

  // 클라 측 세션 변경(로그인/로그아웃/토큰갱신)이 발생하면 /api/auth/me 재조회
  useEffect(() => {
    const { data: sub } = sbClient.auth.onAuthStateChange(() => {
      mutate()
    })
    return () => sub.subscription.unsubscribe()
  }, [mutate])

  // 컴포넌트 사용 편의 위해 Session 타입 흉내 (user만 쓰면 충분)
  const session: Session | null = data?.user ? ({ user: data.user } as Session) : null

  return {
    session,
    ready: !isLoading,
    refresh: () => mutate(),
  }
}
