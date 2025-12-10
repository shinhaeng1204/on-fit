// app/api/auth/signup/route.ts
import { createSupabaseServerClient, fail, ok } from "@/lib/route-helpers";

export async function POST(req: Request) {
  const body = await req.json();
  const { email, password } = body;

  const supabase = await createSupabaseServerClient();

  // 🔥 1) 먼저 중복 이메일 확인
  const { data: existingUser, error: lookupError } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", email)
    .maybeSingle();

      if (existingUser) {
    return fail("이미 가입된 이메일입니다.", 400);
  }

  if (lookupError) {
    return fail("이메일 조회 중 오류가 발생했습니다.", 400);
  }


  // 🔥 2) 중복이 아닐 때만 signUp 실행
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/confirm`,
    },
  });

  if (error) {
    return fail("회원가입 중 오류가 발생했습니다.", 400);
  }

  return ok({ user: data.user });
}