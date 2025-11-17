// app/auth/page.tsx  ⬅️ 서버 컴포넌트(클라이언트 훅 X)
import Link from "next/link"
import AuthTabs from "@/components/auth/AuthTabs" // ↓ 2)에서 만듭니다.

type Props = {
  searchParams: { tab?: string; notice?: string }
}

export default async function AuthPage({ searchParams }: Props) {
  const initialTab = searchParams.tab === "signup" ? "signup" : "login"
  const initialNotice =
    searchParams.notice === "verify"
      ? "회원가입이 완료됐어요. 이메일을 열고 인증 버튼을 눌러주세요."
      : null

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-subtle p-4">
      <div className="w-full max-w-md space-y-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          {/* 아이콘은 서버에서 그대로 렌더 가능 */}
          <span aria-hidden>←</span>
          홈으로 돌아가기
        </Link>

        {/* 상호작용 영역은 클라 컴포넌트로 */}
        <AuthTabs initialTab={initialTab} initialNotice={initialNotice} />
      </div>
    </div>
  )
}