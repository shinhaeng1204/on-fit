// app/auth/AuthTabsClientWrapper.tsx
'use client'

import AuthTabs from "@/components/auth/AuthTabs";
// 필요하면 여기서 useSearchParams, useRouter 도 사용 가능
// import { useSearchParams } from "next/navigation";

type Props = {
  initialTab: "login" | "signup";
  initialNotice: string | null;
};

export default function AuthTabsClientWrapper({
  initialTab,
  initialNotice,
}: Props) {
  // 만약 URL에서 tab을 다시 읽어서 덮어쓰고 싶다면 이렇게도 가능:
  //
  // const sp = useSearchParams();
  // const tabFromURL = sp.get("tab");
  // const effectiveTab = (tabFromURL === "signup" ? "signup" : "login") as "login" | "signup";
  //
  // return <AuthTabs initialTab={effectiveTab} initialNotice={initialNotice} />;

  return (
    <AuthTabs
      initialTab={initialTab}
      initialNotice={initialNotice}
    />
  );
}
