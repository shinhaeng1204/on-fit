// app/auth/page.tsx
import Link from "next/link";
import { Suspense } from "react";
import AuthTabsClientWrapper from "./components/AuthTabsClientWrapper";

type Props = {
  // ✅ Next 15 스타일: searchParams가 Promise로 옴
  searchParams: Promise<{ tab?: string; notice?: string }>;
};

export default async function AuthPage({ searchParams }: Props) {
  // ✅ 먼저 Promise 풀기
  const sp = await searchParams;

  const tabParam = sp.tab;
  // 🔥 "login" | "signup" 리터럴 타입으로 확정
  const initialTab: "login" | "signup" =
    tabParam === "signup" ? "signup" : "login";

  const noticeParam = sp.notice;
  const initialNotice =
    noticeParam === "verify"
      ? "회원가입이 완료됐어요. 이메일을 열고 인증 버튼을 눌러주세요."
      : null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-subtle p-4">
      <div className="w-full max-w-md space-y-4">
        <Link
          href="/on-fit/on-fit-next/public"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <span aria-hidden>←</span>
          홈으로 돌아가기
        </Link>

        {/* useSearchParams 같은 클라 훅은 Suspense 아래에서만 */}
        <Suspense fallback={<p className="text-sm text-muted-foreground">로그인 화면을 불러오는 중…</p>}>
          <AuthTabsClientWrapper
            initialTab={initialTab}
            initialNotice={initialNotice}
          />
        </Suspense>
      </div>
    </div>
  );
}
