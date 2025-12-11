"use client";

import { useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useToast } from "@/app/(view)/(main)/mypage/components/Toast";

export default function MyPageToastWatcher() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { show } = useToast();

  // ⚡ StrictMode로 인해 useEffect가 2회 실행되는 문제 차단
  const hasHandled = useRef(false);

  useEffect(() => {
    const updated = searchParams.get("updated");
    if (!updated) return;

    // 이미 처리한 적 있으면 실행하지 않음
    if (hasHandled.current) return;
    hasHandled.current = true;

    if (updated === "region") {
      show("동네가 변경되었습니다!");
    }

    if (updated === "nickname") {
      show("닉네임이 변경되었습니다!");
    }

    // 🔥 쿼리 제거 (새로고침해도 토스트 다시 안 뜸)
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.delete("updated");

    router.replace(`?${newParams.toString()}`, { scroll: false });
  }, [searchParams, router, show]);

  return null;
}
