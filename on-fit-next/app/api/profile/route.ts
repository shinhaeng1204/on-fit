import { requireUserOr401, ok, fail, createSupabaseServerClient } from "@/lib/route-helpers";
import {cookies} from "next/headers";
import {NextResponse} from "next/server";
import {createClient} from "@supabase/supabase-js";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
  const supabase = await createSupabaseServerClient();

  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("sb-access-token")?.value;

    if (!accessToken) {
      return NextResponse.json({ error: "로그인 후 이용할 수 있습니다." }, { status: 401 });
    }

    // auth로 user 조회
    const authClient = createClient(url, anonKey);
    const { data: userData, error: userError } = await authClient.auth.getUser(accessToken);

    if (userError || !userData?.user) {
      console.error("Invalid user token:", userError);
      return NextResponse.json(
        { error: "유저 정보를 불러올 수 없습니다." },
        { status: 401 }
      );
    }

    const user = userData.user;

    // 프로필 조회
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileError) {
      return NextResponse.json(
        { error: profileError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ profile });

  } catch (e: any) {
    console.error("GET /messages error:", e);
    return NextResponse.json(
      { error: e.message ?? "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient();
  const auth = await requireUserOr401(supabase);
  if (!auth.ok) return auth.response;
  const user = auth.user;

  // 1) 바디 파싱
  let body: any;
  try {
    body = await req.json();
  } catch {
    return fail("INVALID_JSON_BODY", 400);
  }

  // 값 정규화: undefined/null을 구분해서 "보낸 것만" 반영할 수 있게
  const nickname =
    typeof body?.nickname === "string" ? body.nickname.trim() : body?.nickname; // string | null | undefined
  const location =
    typeof body?.location === "string" ? body.location.trim() : body?.location; // string | null | undefined
  const sport_preference = Array.isArray(body?.sport_preference)
    ? body.sport_preference
    : body?.sport_preference; // string[] | null | undefined

  // 2) 현재 프로필 존재 여부
  const { data: existing, error: existErr } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (existErr) return fail(existErr.message, 500);

  // 3-A) 없으면 → 최초 생성 (닉네임 필수)
  if (!existing) {
    if (typeof nickname !== "string" || nickname.length === 0) {
      return fail("NICKNAME_REQUIRED", 400);
    }

    const { error } = await supabase.from("profiles").insert({
      id: user.id,
      email: user.email ?? null,
      nickname, // 최초 생성이므로 필수로 저장
      location: typeof location === "string" && location.length > 0 ? location : null,
      sport_preference: Array.isArray(sport_preference) ? sport_preference : [],
      created_at: new Date(),
      updated_at: new Date(),
    });

    if (error) return fail(error.message, 500);
    return ok({ created: true });
  }

  // 3-B) 있으면 → 부분 업데이트 (보낸 필드만 반영, 닉네임 안 보내도 OK)
  const patch: Record<string, any> = { updated_at: new Date() };

  // null/undefined는 무시해서 기존 값 유지
  if (typeof nickname === "string" && nickname.length > 0) patch.nickname = nickname;
  if (typeof location === "string" && location.length > 0) patch.location = location;
  if (Array.isArray(sport_preference)) patch.sport_preference = sport_preference;

  // 변경할 필드가 없으면 No-Op로 성공 처리(원하면 에러로 바꿔도 됨)
  if (Object.keys(patch).length === 1) {
    return ok({ created: false, noop: true });
  }

  const { error } = await supabase.from("profiles").update(patch).eq("id", user.id);
  if (error) return fail(error.message, 500);

  return ok({ created: false });
}