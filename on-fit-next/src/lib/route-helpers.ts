import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse } from "next/server";

// next/headers 쿠키 객체를 최소한으로 모델링 (any 금지)
type CookieStore = {
  get(name: string): { value: string } | undefined;
  // Server Component 환경에선 set이 없을 수 있으니 optional
  set?: (opts: { name: string; value: string } & CookieOptions) => void;
};

export async function createSupabaseServerClient() {
  const raw = await cookies(); // ← 핵심: await!
  const cookieStore = raw as unknown as CookieStore;

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      // @supabase/ssr - deprecated 형태(get/set/remove) 시그니처에 맞춘 어댑터
    cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
      },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set?.({ name, value, ...options });
          } catch {
            // RSC 등 set 불가 환경은 무시
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set?.({ name, value: '', ...options, maxAge: 0 });
          } catch {
            // RSC 등 set 불가 환경은 무시
          }
      },
    },
    }
  );
}

/** 로그인 유저를 강제(require) — 없으면 401 응답 리턴 */
export async function requireUserOr401(supabase: Awaited<ReturnType<typeof createServerClient>>) {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    return { ok: false as const, response: NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 }) };
  }
  return { ok: true as const, user };
}

/** 공통 응답 헬퍼 */
export const ok = (data: Record<string, any>, init?: ResponseInit) =>
  NextResponse.json({ ok: true, ...data }, init);

export const fail = (message: string, status = 400) =>
  NextResponse.json({ ok: false, error: message }, { status });

/** KST(date+time) → ISO 문자열 */
export function toISOFromKST(date: string, time: string) {
  const d = new Date(`${date}T${time}:00+09:00`);
  if (isNaN(d.getTime())) return null;
  return d.toISOString();
}
