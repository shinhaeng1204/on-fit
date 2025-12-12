import { redirect } from "next/navigation"
import { createSupabaseServerClient } from "@/lib/route-helpers"

export default async function AuthCheckPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {

  const params = await searchParams;   // 🔥 반드시 await로 풀어야 함
  const next = params.next || "/";

  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/auth?next=${encodeURIComponent(next)}`)
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  if (!profile?.nickname || !profile?.home_region) {
    redirect(`/profile-setup?next=${encodeURIComponent(next)}`)
  }

  redirect(next)
}