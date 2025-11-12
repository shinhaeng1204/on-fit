import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export const runtime = "nodejs"; // 이 라우트는 Node.js 런타임에서 돌리겠다는 의미

export async function POST(req: Request) {
  // ✅ 1. Promise unwrap
  const cookieStore = await cookies();

  // ✅ 2. createServerClient 구성
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async get(name: string) {
          const allCookies = await cookieStore; // ✅ Promise unwrap 다시 보장
          const value = allCookies.get(name)?.value;
          return value;
        },
        async set(name: string, value: string, options: any) {
          try {
            const allCookies = await cookieStore;
            allCookies.set({ name, value, ...options });
          } catch (err) {
            console.error("쿠키 set 실패", err);
          }
        },
        async remove(name: string, options: any) {
          try {
            const allCookies = await cookieStore;
            allCookies.delete({ name, ...options });
          } catch (err) {
            console.error("쿠키 remove 실패", err);
          }
        },
      },
    }
  );

  // ✅ 3. 인증 세션 확인
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error("❌ 인증 실패:", userError);
    return NextResponse.json({ error: "INVALID_USER" }, { status: 401 });
  }

  // ✅ 4. 요청 파싱
  const body = await req.json();
  const { nickname, location, sport_preference } = body;

  // ✅ 5. DB 업데이트
  const { error } = await supabase
    .from("profiles")
    .upsert({
      id: user.id,
      email: user.email ?? null,
      nickname,
      location,
      sport_preference,
      updated_at: new Date(),
    });

  if (error) {
    console.error("❌ 프로필 저장 오류:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}