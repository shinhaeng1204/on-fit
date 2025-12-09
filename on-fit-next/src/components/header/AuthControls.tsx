'use client'

import Link from "next/link"
import { useAuthSession } from "@/hooks/useAuthSession"
import LogoutButton from "../../app/(view)/auth/components/LogoutButton"
import { Button } from "../common/Button"
import { User } from "lucide-react"
import {useQuery} from "@tanstack/react-query";
import {api} from "@/lib/axios";

export default function AuthControls() {
  const { session, ready } = useAuthSession()

  const userId = session?.user?.id ?? null

  const { data: profileData } = useQuery({
    queryKey: ["profile", userId],
    queryFn: async () => {
      const res = await api.get("/api/profile/me")
      return res.data
    },
    enabled: !!userId,
  })

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