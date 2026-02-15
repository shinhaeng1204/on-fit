import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export async function POST(req: Request) {
  const { access_token, refresh_token, expires_at } = await req.json();

  if (!access_token || !refresh_token) {
    return NextResponse.json({ ok: false, error: "TOKEN_MISSING" }, { status: 400 });
  }

  const cookieStore = await cookies();

  // ✅ Supabase 서버 클라이언트 생성
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => cookieStore.get(name)?.value,
        set: (name: string, value: string, options: any) => {
          cookieStore.set({ name, value, ...options });
        },
        remove: (name: string, options: any) => {
          cookieStore.delete({ name, ...options });
        },
      },
    }
  );

  // ✅ 쿠키 설정 (기존처럼)
  const res = NextResponse.json({ ok: true });
  const isProd = process.env.NODE_ENV === "production";

  res.cookies.set("sb-access-token", access_token, {
    httpOnly: true,
    sameSite: "lax",
    secure: isProd,
    path: "/",
    expires: expires_at ? new Date(expires_at * 1000) : new Date(Date.now() + 3600_000),
  });
  res.cookies.set("sb-refresh-token", refresh_token, {
    httpOnly: true,
    sameSite: "lax",
    secure: isProd,
    path: "/",
    expires: new Date(Date.now() + 30 * 24 * 3600_000),
  });

  // ✅ 핵심: Supabase 내부 세션 캐시에 동기화
  const { error } = await supabase.auth.setSession({
    access_token,
    refresh_token,
  });

  if (error) {
    console.error("❌ 세션 설정 실패:", error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
  }

  return res;
}