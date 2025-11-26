import { redirect } from "next/navigation"
import { createSupabaseServerClient } from "@/lib/route-helpers"

export default async function AuthCheckPage({
  searchParams,
}: {
  searchParams: { next?: string }
}) {
  const supabase = await createSupabaseServerClient()

  // user 체크
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth")

  // next 값 추출 (없으면 홈으로)
  const next = searchParams?.next || "/"

  // 프로필 체크
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  if (!profile?.nickname || !profile?.location) {
    redirect(`/profile-setup?next=${encodeURIComponent(next)}`)
  }

  // 🔥 프로필 OK → next로 이동
  redirect(next)
}