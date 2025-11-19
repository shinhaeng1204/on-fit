// app/auth/check/page.tsx
import { redirect } from "next/navigation"
import { createSupabaseServerClient } from "@/lib/route-helpers"

export default async function AuthCheckPage() {
  const supabase = await createSupabaseServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth")

  // 프로필 체크
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  if (!profile?.nickname || !profile?.location) {
    redirect("/profile-setup")
  }

  redirect("/")
}