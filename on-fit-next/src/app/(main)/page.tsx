'use client'
import HeroImage from "@/assets/hero.jpeg"
import { Button } from "@/components/common/Button"
import Filter from "@/components/main/Filter"
import FitCard from "@/components/main/FitCard"
import KakaoLogin from "@/components/KakaoLogin"
import { Plus } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import { api } from "@/lib/axios"

type FitRow = {
    id: string
    sport: string
    title: string
    location: string
    date_time: string
    level: 'bronze' | 'silver' | 'gold' | 'platinum'
    status: '모집중' | '마감'
    current_participants: number
    max_participants: number
    author?: string

}
export default function Home() {
    const router = useRouter()
    const [items, setItems] = useState<FitRow[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // 날짜 시간 포맷터 (KST 기준)
    const toKstDate = (iso: string) => {
        const d = new Date(iso)
        // KST 보정
        const kst = new Date(d.getTime() + 9 * 60 * 60 * 1000)
        const m = kst.getMonth() + 1
        const day = kst.getDate()
        return `${m}월 ${day}일`
    }

    const toKstTime = (iso: string) => {
        const d = new Date(iso)
        const kst = new Date(d.getTime() + 9 * 60 * 60 * 1000)
        const hh = String(kst.getHours()).padStart(2, '0')
        const mm = String(kst.getMinutes()).padStart(2, '0')
        return `${hh}:${mm}`

    }

    useEffect(() => {
        let mounted = true;
        (async () => {
            try{
                setLoading(true)
                setError(null)

                const res = await api.get('/api/posts')
                if(!mounted) return
                const rows: FitRow[] = res.data?.items ?? []
                setItems(rows)
            } catch (e: any) {
                if(!mounted) return
                setError(e?.response?.data?.error ?? e.message ?? '알 수 없는 오류')
            } finally {
                if (mounted) setLoading(false)
            }
        })()
        return () => {
            mounted = false
        }
    }, [])
   
    const cards = useMemo(
    () =>
      items.map((r) => ({
        id: r.id,
        sport: r.sport,
        title: r.title,
        location: r.location,
        date: toKstDate(r.date_time),
        time: toKstTime(r.date_time),
        currentParticipants: r.current_participants,
        maxParticipants: r.max_participants,
        level: r.level,
        status: r.status,
        author: r.author ?? '익명',
      })),
    [items]
  )

    return(
        <>
        {/* 히어로 이미지 */}
        <section className="w-full relative py-30 md:py-35 border-border border-b">
            <Image
            src={HeroImage}
            alt="메인 배너"
            fill
            className="w-full object-cover opacity-50"/>
            <div className="absolute top-10 ml-10 text-3xl md:text-4xl font-bold">
                <div className="flex">
                     <div>동네에서 함께 운동할&nbsp; </div>
                     <div className="text-gradient-brand hidden md:block">운동 메이트를&nbsp; </div>
                     <div className="hidden md:block">찾아보세요</div>
                     </div> 
               
                <div className="flex md:hidden">
                    <div className="text-gradient-brand">운동 메이트를&nbsp; </div>
                    <div>찾아보세요</div>
                </div>
                <div className="mt-3 md:text-base font-medium text-sm text-muted-foreground">실력과 취향에 맞는 운동 메이트를 만나 <br className="md:hidden"/> 즐겁게 운동하세요</div>
                <Button 
                variant="hero"
                size="default"
                leftIcon={<Plus/>}
                className="mt-3 md:mt-10"
                onClick={() => router.push("/post/create")}
                >번개 만들기</Button>
                
                 </div>
                 
            
            
        </section>
        
        
            <Filter/>
            <div className="flex flex-col gap-6 md:grid md:grid-cols-3 mx-5">
            {cards.map((fit) => (
          <FitCard
            key={fit.id}
            title={fit.title}
            status={fit.status}
            sport={fit.sport}
            location={fit.location}
            date={fit.date}
            time={fit.time}
            currentParticipants={fit.currentParticipants}
            maxParticipants={fit.maxParticipants}
            level={fit.level}
          />
        ))}
        </div>
       

        </>
    )
}