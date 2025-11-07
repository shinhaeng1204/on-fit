// src/app/mypage/layout.tsx
import type { ReactNode } from "react";
import { ToastProvider } from "@/app/mypage/components/Toast";
import TopBar from "@/app/mypage/components/TopBar";
import BottomNav from "@/components/common/BottomNav"; // ✅ 공통 컴포넌트로 import

export default function MyPageLayout({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <div className="flex min-h-dvh flex-col">
        <TopBar bordered />
        <main className="flex-1 mx-auto w-full max-w-screen-md px-4 pb-24 pt-4">
          {children}
        </main>
        <div className="sticky bottom-0 left-0 w-full">
          <BottomNav />
        </div>
      </div>
    </ToastProvider>
  );
}
