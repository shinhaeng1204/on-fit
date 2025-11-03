
import HeroImage from "@/assets/hero.jpeg"
import { Button } from "@/components/common/Button"
import Filter from "@/components/common/main/Filter"
import KakaoLogin from "@/components/KakaoLogin"
import { Plus } from "lucide-react"
import Image from "next/image"
export default function Home() {
    return(
        <>
        <div className="hidden">
          <KakaoLogin />
        </div>
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
        {/*게시글*/}<Filter/>
        <section></section>

        </>
    )
}