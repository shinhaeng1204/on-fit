// app/(main)/page.tsx  ← 서버 컴포넌트
import AfterAuthRefetchOnce from "./AfterAuthRefetchOnce"
import Hero from "@/components/main/Hero";
import FitListInfinite from "@/components/main/FitListInfinite";
import { OnboardingModal } from "@/components/common/OnBoardingModal";

export default async function Home() {
  return (
    <>
      <AfterAuthRefetchOnce />

      {/* 히어로 섹션 */}
      <Hero />
      <OnboardingModal />

      {/* 리스트 섹션 */}
      <FitListInfinite />
    </>
  )
}
