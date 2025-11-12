import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse } from "next/server";

const { NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY } = process.env;

export async function createSSRClient() {
  if (!NEXT_PUBLIC_SUPABASE_URL || !NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error("Supabase env is missing");
  }

  const cookieStore = await cookies();

  return createServerClient(NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      async get(name: string) {
        const all = await cookieStore;
        return all.get(name)?.value;
      },
      async set(name: string, value: string, options: CookieOptions) {
        const all = await cookieStore;
        all.set({ name, value, ...options });
      },
      async remove(name: string, options: CookieOptions) {
        const all = await cookieStore;
        all.delete({ name, ...options });
      },
    },
  });
}

/** 로그인 유저를 강제(require) — 없으면 401 응답 리턴 */
export async function requireUserOr401(supabase: Awaited<ReturnType<typeof createSSRClient>>) {
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
