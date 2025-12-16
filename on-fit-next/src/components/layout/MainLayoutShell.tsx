// components/layout/MainLayoutShell.tsx
'use client'

import Link from 'next/link'
import { useEffect, useState } from "react"
import Header from "@/components/common/Header"
import BottomNav from "@/components/common/BottomNav"
import LocationModal from "@/components/header/LocationModal"
import { MapPin } from "lucide-react"
import AuthControls from "@/components/header/AuthControls"
import { usePathname } from "next/navigation";
import { NotificationDropdown } from "@/components/common/NotificationDropdown"
import { useNotifications } from "@/components/provider/NotificationProvider"
import Image from "next/image"
import { User } from "@supabase/supabase-js"

export default function MainLayoutShell({ user, children }: { user:User | null; children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const [region, setRegion] = useState<string | null>(null)
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)

  const pathname = usePathname()

  const isPost = pathname.startsWith('/post')
  const isChatRoot = pathname === '/chat'          //  딱 /chat만
  const isChatOther = pathname.startsWith('/chat') && !isChatRoot // /chat/... 전부
  const isCalendar = pathname.startsWith('/calendar') 
   // ⬇️ Notification Provider에서 알림 정보 가져오기
  const { notifications, markAllRead, deleteOne, markOneRead, deleteAll } = useNotifications()

  // 🔹 새로고침해도 마지막 위치 기억하기
  useEffect(() => {
    if (typeof window === 'undefined') return

    const savedRegion = window.localStorage.getItem('onfit.region')
    const savedCoords = window.localStorage.getItem('onfit.coords')

    if (savedRegion) {
      setRegion(savedRegion)
    }

    if (savedCoords) {
      try {
        const parsed = JSON.parse(savedCoords) as { lat: number; lng: number }
        setCoords(parsed)
      } catch (e) {
        console.error('Invalid coords in localStorage', e)
      }
    }
  }, [])

  return (
    <div className={isChatOther ? "" : "mb-24"}>
      {/* 헤더 */}
      {isPost ? (
        <Header
          variant="back"
          title="뒤로가기"
          containerClassName="bg-card/80 backdrop-blur-sm border-b border-border"
        />
      ) : (isChatOther) ? null : (
        <Header
          variant="main"
          left={
            <Link href="/">
              <Image src="/logo.png" alt="로고" width={100} height={40} className="object-cover h-8" />
            </Link>
          }
          titleClassName="text-2xl text-gradient-brand font-bold"
          containerClassName="bg-card/80 backdrop-blur-sm border-b border-border"
          right={
            <div className="flex items-center gap-2 ">
              {/* 여기서 현재 위치 표시 */}
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
              >
                <MapPin className="w-5 h-5" />
                <span className="hidden md:block">{region ?? '현재 위치 설정'}</span>
              </button>

              <NotificationDropdown
                notifications={notifications}
                onMarkAllRead={markAllRead}
                onDelete={deleteOne}
                onMarkOneRead={markOneRead}
                deleteAll={deleteAll}
                user={user}
              />
              <AuthControls />
            </div>
          }
        />
      )}

      <div>
        {children}

        <LocationModal
          open={open}
          onClose={() => setOpen(false)}
          onSelect={(label, lat, lng) => {
            setRegion(label)
            setCoords({ lat, lng })

            //  새로고침해도 유지되도록 localStorage에 저장
            if (typeof window !== 'undefined') {
              window.localStorage.setItem('onfit.region', label)
              window.localStorage.setItem('onfit.coords', JSON.stringify({ lat, lng }))
            }
          }}
        />
      </div>

      {(isPost || isChatOther) ? null : <BottomNav />}
    </div>
  )
}
