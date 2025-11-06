import type { ReactNode } from "react";
import BottomNav from "@/components/common/BottomNav";
import { Button } from "@/components/common/Button";
import { Settings } from "lucide-react";

export default function MyPageLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh flex flex-col">
      <header className="sticky top-0 z-20 backdrop-blur bg-background/60 border-b">
        <div className="mx-auto w-full max-w-3xl px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg font-semibold">마이페이지</h1>
          <Button variant="ghost" size="sm" href="/settings" aria-label="설정">
            <Settings className="size-4" />
            <span className="ml-1 hidden sm:inline"></span>
          </Button>
        </div>
      </header>

      {/* 레이아웃이 컨테이너 폭/여백을 관리 */}
      <main className="mx-auto w-full max-w-3xl px-4 py-6 flex-1">{children}</main>
      <BottomNav />
    </div>
  );
}
