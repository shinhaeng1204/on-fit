// app/(main)/page.tsx  ← 서버 컴포넌트

import Image from "next/image"
import HeroImage from "@/assets/hero.jpeg"

import FitList from "@/components/main/FitList"
import AfterAuthRefetchOnce from "./AfterAuthRefetchOnce"
import { toKstDate, toKstTime } from "@/lib/dateFormatter"
import { Button } from "@/components/common/Button"
import { Plus } from "lucide-react"
import { createSupabaseServerClient } from "@/lib/route-helpers"
import type { postType } from "@/types/post"

// 최신 목록이 항상 필요하면
export const revalidate = 0
// 또는: export const dynamic = "force-dynamic"

// Supabase에서 조인해서 가져올 때의 Row 타입 (대략적인 형태)
type SupabasePostRow = {
  id: string
  title: string
  sport: string
  status: string
  description?: string | null
  location: string
  max_participants: number
  current_participants: number
  level: string
  requirement?: string | null
  fee?: string | null
  room_id?: string | null
  date_time: string
  latitude: number | null
  longitude: number | null
  region_label: string | null

  // author_id FK로 조인된 profiles
  profiles?: unknown
}

async function getFits(): Promise<postType[]> {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from("posts")
    .select(`
      *,
      profiles:author_id (
        id,
        nickname,
        profile_image
      )
    `)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("getFits error:", error)
    return []
  }

  const rows = (data ?? []) as SupabasePostRow[]

  const posts: postType[] = rows.map((row) => {
    const dateTime = row.date_time

    return {
      id: row.id,
      // key는 안 쓰면 생략 가능, 필요하면 row.id 등으로 넣기
      // key: row.id,
      title: row.title,
      sport: row.sport,
      status: row.status,
      description: row.description ?? undefined,
      location: row.location,
      profile: (row.profiles ?? undefined) as any, // Profile 타입으로 캐스팅

      
      date_time: dateTime,
      date: dateTime ? toKstDate(dateTime) : "",
      time: dateTime ? toKstTime(dateTime) : "",

      max_participants: row.max_participants,
      current_participants: row.current_participants,
      level: row.level as any, // BadgeType으로 캐스팅

      requirement: row.requirement ?? undefined,
      fee: row.fee ?? undefined,
      room_id: row.room_id ?? undefined,

      latitude: row.latitude,
      longitude: row.longitude,
      region_label: row.region_label
    }
  })

  return posts
}

export default async function Home() {
  const items = await getFits()

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
            실력과 취향에 맞는 운동 메이트를 만나{" "}
            <br className="md:hidden" />
            즐겁게 운동하세요
          </div>

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

      {/* 리스트 섹션 */}
      <FitList items={items} />
    </>
  )
}
