import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/route-helpers"

export const dynamic = "force-dynamic"

export async function GET() {
  const supabase = await createSupabaseServerClient()

  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return NextResponse.json({ ok: true, user: null })
  }

  return NextResponse.json({
    ok: true,
    user
  })
}