'use client'

import { useRouter } from "next/navigation"
import { sbClient } from "@/lib/supabase-client"
import { Button } from "../common/Button"
import { LogOut } from "lucide-react"
import { mutate } from "swr"
import { useNotifications } from "../common/NotificationProvider"

export default function LogoutButton(){
    const router = useRouter()
    const {clearAll} = useNotifications()
    const onLogout = async () => {
    try {
      // 서버가 Supabase signOut + HttpOnly 쿠키 제거
      const res = await fetch('/api/auth/logout', { method: 'POST' })
      if (!res.ok) throw new Error('logout failed')

        await sbClient.auth.signOut().catch(()=>{})
        clearAll()
        await mutate("/api/auth/me");
        router.replace('/')
        router.refresh
    } catch (e) {
      console.error('[logout] failed:', e)
      // (선택) 사용하던 클라 세션이 있을 수도 있으니 안전하게 한 번 더
      // await sbClient.auth.signOut().catch(() => {})
    }
  }
    return (
      <>
      <div className="hidden md:block">
        <Button type="button" onClick={onLogout} variant="outline" className="w-full">
            로그아웃
        </Button>
      </div>
        <LogOut className="block md:hidden" onClick={onLogout}/>
        </>
    )
}