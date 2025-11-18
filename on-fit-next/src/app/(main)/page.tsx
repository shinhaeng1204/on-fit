// app/(main)/page.tsx  ← 'use client' 삭제 (서버 컴포넌트)
import Image from "next/image"
import HeroImage from "@/assets/hero.jpeg"

import FitList from "@/components/main/FitList"
import AfterAuthRefetchOnce from "./AfterAuthRefetchOnce" // (클라 컴포넌트: 그대로 OK)
import { toKstDate, toKstTime } from "@/lib/dateFormatter"
import { Button } from "@/components/common/Button"
import { Plus } from "lucide-react"
import { createSupabaseServerClient } from "@/lib/route-helpers"

type FitRow = {
  id: string
  sport: string
  title: string
  location: string
  date_time: string
  level: '브론즈' | '실버' | '골드' 
  status: '모집중' | '마감'
  current_participants: number
  max_participants: number
  author?: string | null
}

// 최신 목록이 항상 필요하면:
export const revalidate = 0 // 혹은 export const dynamic = "force-dynamic"

async function getFits(): Promise<FitRow[]> {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    // Next의 error.js로 위임하거나, 여기서 안전한 값 리턴
    // throw new Error(error.message)
    return []
  }
  return data ?? []
}

export default async function Home() {
  const items = await getFits()

 const cards = items.map((r) => ({
    id: r.id,
    sport: r.sport,
    title: r.title,
    location: r.location,
    date: toKstDate(r.date_time),
    time: toKstTime(r.date_time),
    currentParticipants: r.current_participants,
    maxParticipants: r.max_participants,
    level: r.level as "브론즈" | "실버" | "골드",
    status: r.status,
    author: r.author ?? "익명",
  }))

  return (
    <>
      <AfterAuthRefetchOnce />

      {/* 히어로 섹션 */}
      <section className="relative w-full py-30 md:py-35 border-b border-border">
        <Image
          src={HeroImage}
          alt="메인 배너"
          fill
          className="w-full object-cover opacity-50"
          priority
        />
        <div className="absolute top-10 ml-10 text-3xl md:text-4xl font-bold">
          <div className="flex">
            <div>동네에서 함께 운동할&nbsp;</div>
            <div className="text-gradient-brand hidden md:block">운동 메이트를&nbsp;</div>
            <div className="hidden md:block">찾아보세요</div>
          </div>

          <div className="flex md:hidden">
            <div className="text-gradient-brand">운동 메이트를&nbsp;</div>
            <div>찾아보세요</div>
          </div>

          <div className="mt-3 text-sm md:text-base font-medium text-muted-foreground">
            실력과 취향에 맞는 운동 메이트를 만나 <br className="md:hidden" /> 즐겁게 운동하세요
          </div>

          {/* onClick으로 router.push를 쓰지 말고 Link로 교체 → 페이지가 클라로 격상되는 걸 방지 */}
          <Button
  href="/post/create"
  variant="hero"
  size="default"
  leftIcon={<Plus />}
  className="mt-3 md:mt-10"
>
  번개 만들기
</Button>
        </div>
      </section>

      {/* 필터 (클라 컴포넌트여도 OK) */}
            <FitList items={cards} />

    </>
  )
}
