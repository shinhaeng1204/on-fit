'use client'

import { cn } from "@/lib/utils"
import { Calendar, Home, User } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export default function BottomNav() {
  const pathname = usePathname()

  const navItems = [
    { icon: Home, label: "홈", path: "/" },
    { icon: Calendar, label: "달력", path: "/calendar" },
    { icon: User, label: "마이페이지", path: "/mypage" },
  ]

  return (
    <nav className="bg-background fixed bottom-0 w-full h-20 border-t border-border">
      <div className="flex justify-around items-center h-full ">
        {navItems.map((item) => {
          const isActive = pathname === item.path
          const Icon = item.icon

          return (
            <Link
              key={item.path}
              href={item.path}
              className={cn(
                "flex flex-col items-center justify-center flex-1 gap-1 transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
