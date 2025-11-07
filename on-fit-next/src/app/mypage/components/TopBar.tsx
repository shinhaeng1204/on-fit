"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Settings } from "lucide-react";
import { clsx } from "clsx";

type TopBarProps = {
  bordered?: boolean;
  className?: string;
};

export default function TopBar({ bordered = true, className }: TopBarProps) {
  const router = useRouter();

  return (
    <header
      className={clsx(
        "sticky top-0 z-40 w-full",
        "bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60",
        bordered && "border-b border-border",
        className
      )}
    >
      <div className="mx-auto flex h-12 max-w-screen-md items-center justify-between px-4">
        {/* 좌측: 뒤로가기 */}
        <button
          type="button"
          aria-label="뒤로가기"
          onClick={() => router.back()}
          className="flex items-center gap-1.5 rounded-md px-2 py-1.5 hover:bg-foreground/5 active:scale-95 transition"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="text-sm leading-none">뒤로</span>
        </button>

        {/* 가운데 비움 (정렬용) */}
        <div className="flex-1" />

        {/* 우측: 설정 아이콘 (드롭다운 X, 페이지 이동) */}
        <Link
          href="/settings"
          aria-label="설정"
          className="inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-foreground/5"
        >
          <Settings className="h-5 w-5" />
        </Link>
      </div>
    </header>
  );
}
