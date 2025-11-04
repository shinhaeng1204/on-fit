
import HeroImage from "@/assets/hero.jpeg"
import { Button } from "@/components/common/Button"
import Filter from "@/components/main/Filter"
import FitCard from "@/components/main/FitCard"
import KakaoLogin from "@/components/KakaoLogin"
import { Plus } from "lucide-react"
import Image from "next/image"
export default function Home() {
    type Level = 'bronze' | 'silver' | 'gold' | 'platinum'
    type Status = '모집중' | '마감'
    
    const mockFits: Array<{
  id: string
  sport: string
  title: string
  location: string
  date: string
  time: string
  currentParticipants: number
  maxParticipants: number
  level: Level
  status: Status
  author: string
}> 
=[
  {
    id: "1",
    sport: "배드민턴",
    title: "강남 배드민턴 초급자 모집!",
    location: "강남구 역삼동 체육관",
    date: "11월 5일",
    time: "19:00",
    currentParticipants: 3,
    maxParticipants: 6,
    level: "bronze",
    status: "모집중",
    author: "운동왕",
  },
  {
    id: "2",
    sport: "풋살",
    title: "주말 풋살 같이해요~",
    location: "서초구 반포동 풋살장",
    date: "11월 6일",
    time: "14:00",
    currentParticipants: 8,
    maxParticipants: 10,
    level: "silver",
    status: "모집중",
    author: "축구러버",
  },
  {
    id: "3",
    sport: "런닝",
    title: "한강 러닝 크루 모집",
    location: "반포 한강공원",
    date: "11월 4일",
    time: "06:00",
    currentParticipants: 5,
    maxParticipants: 8,
    level: "gold",
    status: "모집중",
    author: "달리기맨",
  },
  {
    id: "4",
    sport: "클라이밍",
    title: "더클라임 같이 가실 분",
    location: "강남구 신사동 더클라임",
    date: "11월 7일",
    time: "20:00",
    currentParticipants: 4,
    maxParticipants: 4,
    level: "platinum",
    status: "마감",
    author: "클라이머",
  },
  {
    id: "5",
    sport: "농구",
    title: "3대3 농구 하실분",
    location: "송파구 잠실 농구장",
    date: "11월 8일",
    time: "18:00",
    currentParticipants: 4,
    maxParticipants: 6,
    level: "silver",
    status: "모집중",
    author: "농구왕",
  },
  {
    id: "6",
    sport: "테니스",
    title: "용산 테니스 레슨 후 게임",
    location: "용산구 테니스장",
    date: "11월 9일",
    time: "10:00",
    currentParticipants: 2,
    maxParticipants: 4,
    level: "bronze",
    status: "모집중",
    author: "테니스조아",
  },
];
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
                <div>동네에서 함께 운동할</div>
                <div className="flex">
                    <div className="text-gradient-brand">운동 메이트를&nbsp; </div>
                    <div>찾아보세요</div>
                </div>
                <div className="mt-3 md:mt-5 font-medium text-sm text-muted-foreground">실력과 취향에 맞는 운동 메이트를 만나 <br className="md:hidden"/> 즐겁게 운동하세요</div>
                <Button 
                variant="hero"
                size="default"
                leftIcon={<Plus/>}
                href="create"
                className="mt-3 md:mt-5"
                >번개 만들기</Button>
                
                 </div>
                 
            
            
        </section>
        
        
            <Filter/>
            <div className="flex flex-col gap-6 md:grid md:grid-cols-3 mx-5">
            {mockFits.map((fit) => (
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