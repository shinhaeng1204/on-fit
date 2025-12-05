'use client';

import Header from '@/components/common/Header';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

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
          <span className="text-base leading-none">목록으로</span>
        </button>
      }
    
      
      className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 border-b border-border"
      containerClassName="px-4 py-2 h-16"
    />
  );
}
