// app/auth/check/page.tsx
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { createClient } from "@supabase/supabase-js"

export default async function AuthCheckPage() {
  const access = (await cookies()).get("sb-access-token")?.value
  if (!access) redirect("/auth")

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data, error } = await supabase.auth.getUser(access)
  if (error || !data.user) redirect("/auth")

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", data.user.id)
    .single()

  if (!profile?.nickname || !profile?.location) {
    redirect("/profile-setup")
  }

  redirect("/")
}