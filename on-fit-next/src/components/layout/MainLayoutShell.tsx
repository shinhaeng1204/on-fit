'use client'

import { useState } from "react"
import Header from "@/components/common/Header"
import BottomNav from "@/components/common/BottomNav"
import LocationModal from "@/components/header/LocationModal"
import { MapPin, Bell, Sun } from "lucide-react"
import AuthControls from "@/components/header/AuthControls"
import { usePathname } from "next/navigation";

export default function MainLayoutShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  const isPost = pathname.startsWith('/post')
  const isChatRoot = pathname === '/chat'          //  딱 /chat만
  const isChatOther = pathname.startsWith('/chat') && !isChatRoot // /chat/... 전부

  return (
    <div className={isChatOther ? "" : "mb-24"}>
      {/* 헤더 */}
      {isPost ? (
        <Header
          variant="back"
          title="목록으로"
          containerClassName="bg-card/80 backdrop-blur-sm border-b border-border"
        />
      ) : isChatOther ? null : ( // /chat/... 에서는 헤더 숨김, /chat 은 보임
        <Header
          variant="main"
          title="온 핏"
          titleClassName="text-2xl text-gradient-brand font-bold"
          containerClassName="bg-card/80 backdrop-blur-sm border-b border-border"
          right={
            <div className="flex items-center gap-5">
              <Sun className="w-5 h-5" />
              <MapPin className="w-5 h-5 cursor-pointer" onClick={() => setOpen(true)} />
              <Bell className="w-5 h-5" />
              <AuthControls />
            </div>
          }
        />
      )}

      <div>
        {children}
        <LocationModal open={open} onClose={() => setOpen(false)} />
      </div>

      {/* BottomNav: /post 나 /chat/... 에서는 숨김, /chat 은 보임 */}
      {(isPost || isChatOther) ? null : <BottomNav />}
    </div>
  )
}
