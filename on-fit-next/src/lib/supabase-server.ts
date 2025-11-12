import { cookies } from 'next/headers';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

// next/headers 쿠키 객체를 최소한으로 모델링 (any 금지)
type CookieStore = {
  get(name: string): { value: string } | undefined;
  // Server Component 환경에선 set이 없을 수 있으니 optional
  set?: (opts: { name: string; value: string } & CookieOptions) => void;
};

/**
 * Next 15/16 환경에서 cookies()가 Promise를 반환하기도 하므로
 * 항상 await로 받아서 타입을 좁혀준다.
 */
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
