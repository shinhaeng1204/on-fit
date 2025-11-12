import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          cookieStore.delete({ name, ...options });
        },
      },
    }
  );

  // 1) 인증 확인
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    return NextResponse.json({ error: "INVALID_USER" }, { status: 401 });
  }

  // 2) 요청 파싱
  const body = await req.json();
  const nickname = body?.nickname;               // string | undefined | null
  const location = body?.location;               // string | undefined | null
  const sport_preference = body?.sport_preference; // string[] | undefined | null

  // 3) 현재 프로필 존재 여부
  const { data: existing, error: existErr } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (existErr) {
    return NextResponse.json({ error: existErr.message }, { status: 500 });
  }

  // 4-A) 행이 없으면 → 최초 생성: 닉네임 필수
  if (!existing) {
    if (typeof nickname !== "string" || nickname.trim() === "") {
      return NextResponse.json(
        { error: "NICKNAME_REQUIRED" },
        { status: 400 }
      );
    }

    const { error } = await supabase.from("profiles").insert({
      id: user.id,
      email: user.email ?? null,
      nickname: nickname.trim(),
      location: typeof location === "string" ? location : null,
      sport_preference: Array.isArray(sport_preference) ? sport_preference : [],
      created_at: new Date(),
      updated_at: new Date(),
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true, created: true });
  }

  // 4-B) 행이 있으면 → 부분 업데이트: 보낸 필드만 반영
  const patch: Record<string, any> = { updated_at: new Date() };
  if (typeof nickname === "string") patch.nickname = nickname.trim();
  if (typeof location === "string") patch.location = location;
  if (Array.isArray(sport_preference)) patch.sport_preference = sport_preference;

  // 닉네임/위치/운동 아무것도 안 보냈으면 에러(선택)
  if (Object.keys(patch).length === 1) {
    return NextResponse.json(
      { error: "NO_FIELDS_TO_UPDATE" },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from("profiles")
    .update(patch)
    .eq("id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, created: false });
}