'use client';

import Header from '@/components/common/Header';
import { ArrowLeft, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function MyPageHeader() {
  const router = useRouter();

  return (
    <Header
      variant="main"
      title={null}
      left={
        <button
          type="button"
          aria-label="뒤로가기"
          onClick={() => router.back()}
          className="flex items-center gap-1.5 rounded-md px-3 py-2 hover:bg-foreground/5 active:scale-95 transition"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="text-base leading-none">뒤로</span>
        </button>
      }
      right={
        <Link
          href="/settings"
          aria-label="설정"
          className="inline-flex h-10 w-10 items-center justify-center rounded-md hover:bg-foreground/5"
        >
          <Settings className="h-6 w-6" />
        </Link>
      }
      
      className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 border-b border-border"
      containerClassName="px-4 py-2 h-16"
    />
  );
}
