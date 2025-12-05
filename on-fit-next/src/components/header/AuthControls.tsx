'use client'

import Link from "next/link"
import { useAuthSession } from "@/hooks/useAuthSession"
import LogoutButton from "../auth/LogoutButton"
import { Button } from "../common/Button"
import { User } from "lucide-react"
import useSWR from "swr"

const fetcher = (url: string) =>
  fetch(url, { credentials: "include" }).then(r => r.json())

export default function AuthControls() {

  // 1️⃣ 훅은 반드시 컴포넌트 최상단에서 실행
  const { session, ready } = useAuthSession()

  // 🔥 세션이 존재할 때만 프로필을 불러오게 해야 문제 없음
  const userId = session?.user?.id ?? null

  const { data: profileData } = useSWR(
    userId ? "/api/profile/me" : null,  // <-- 조건은 여기서만!
    fetcher
  )

  // 2️⃣ 아래부터 조건 렌더링 시작
  if (!ready) {
    return <div className="h-8 w-40 rounded-md bg-muted animate-pulse" />
  }

  if (!session) {
    return (
      <>
        <div className="flex items-center gap-2">
          <Link href="/auth">
            <div className="hidden md:block">
              <Button size="sm" variant="outline">로그인</Button>
            </div>
            <User className="md:hidden block" />
          </Link>
        </div>

        <div className="hidden md:block">
          <Link href="/auth?tab=signup">
            <Button size="sm" variant="hero">회원가입</Button>
          </Link>
        </div>
      </>
    )
  }

  const nickname = profileData?.profile?.nickname

  return (
    <div className="flex items-center md:gap-3">
      <Link href="/mypage">
        <span className="truncate text-sm text-muted-foreground" title={nickname}>
          {nickname}
        </span>
      </Link>
      <LogoutButton />
    </div>
  )
}