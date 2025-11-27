// app/calendar/page.tsx
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/route-helpers";
import CalendarClientPage from "@/components/calendar/CalendarClientPage";

export default async function CalendarPage() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 로그인 안 되어 있으면 로그인 페이지로 이동
  if (!user) {
    redirect("/auth?next=/calendar");
  }

  // 유저가 있으면 클라이언트 컴포넌트 렌더링
  return <CalendarClientPage />;
}