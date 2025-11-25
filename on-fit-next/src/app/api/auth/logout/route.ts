import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createSupabaseServerClient } from "@/lib/route-helpers";

export async function POST() {
  const cookieStore = await cookies();
  const supabase = await createSupabaseServerClient();

  // 🔥 서버에서 token 기반으로 Supabase 로그아웃
  await supabase.auth.signOut();

  // 🔥 HttpOnly 쿠키 삭제
  cookieStore.delete("sb-access-token");
  cookieStore.delete("sb-refresh-token");

  return NextResponse.json({ ok: true });
}