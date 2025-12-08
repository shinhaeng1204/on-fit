import Image from "next/image";
import HeroImage from "@/assets/hero.jpeg";
import {Button} from "@/components/common/Button";
import {Plus} from "lucide-react";

export default function Hero () {
  return (
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
          <br className="md:hidden"/>
          즐겁게 운동하세요
        </div>

        <Button
          href="/post/create"
          variant="hero"
          size="default"
          leftIcon={<Plus/>}
          className="mt-3 md:mt-10"
        >
          번개 만들기
        </Button>
      </div>
    </section>
  )
}