'use client'

import Link from "next/link"
import Image from "next/image"
import { useAuthSession } from "@/hooks/useAuthSession"
import LogoutButton from "../auth/LogoutButton"
import { Button } from "../common/Button"

export default function AuthControls(){
    const {session, ready} = useAuthSession()

    //아직 세션 확인 중이면 스켈레톤/로딩
    if(!ready){
        return (
            <div className="h-8 w-40 rounded-md bg-muted animate-pulse" />
        )
    }

    //비로그인 상태
    if(!session){
        return (
            <div className="flex items-center gap-2">
                <Link href="/auth">
                    <Button size="sm" variant="outline">로그인</Button>
                </Link>
                <Link href="/auth?tab=signup">
                    <Button size="sm" variant="hero">회원가입</Button>
                </Link>
            </div>
        )
    }

    //로그인 상태
    const user = session.user
    const name = 
        (user.user_metadata?.name as string) ||
        (user.user_metadata?.full_name as string) ||
        user.email
    const avatar = 
        (user.user_metadata?.avatar_url as string) || 
        (user.user_metadata?.picture as string) ||
        ''

    return (
    <div className="flex items-center gap-3">
      <span
    className="flex-1 min-w-[3em] max-w-[16em] whitespace-nowrap truncate text-sm text-muted-foreground"
    title={name}
  >
    {name}
  </span>
      <LogoutButton />
    </div>
  )
}