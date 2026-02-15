import type { ReactNode } from 'react';
import { ToastProvider } from '@/app/(view)/(main)/mypage/components/Toast';
import BottomNav from '@/components/common/BottomNav';

export default function MyPageLayout({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <div className="flex min-h-dvh flex-col bg-background">

        {/* 가운데 정렬 + 반응형 패딩/넓이 */}
        <main className="flex-1">
          <div className="mx-auto w-full max-w-5xl px-4 pt-4 pb-24 md:px-6 lg:px-8">
            {children}
          </div>
        </main>

        {/* 하단 네비게이션 (필요하면 lg 이상에서 숨겨도 됨) */}
        <div className="sticky bottom-0 left-0 w-full lg:hidden">
          <BottomNav />
        </div>
      </div>
    </ToastProvider>
  );
}
