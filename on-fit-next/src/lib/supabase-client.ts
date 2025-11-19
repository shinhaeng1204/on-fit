import { createBrowserClient } from "@supabase/ssr";

export const sbClient = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: true,     // ⭐ localStorage 자동 저장
      detectSessionInUrl: true, // OAuth 감지
      storage: typeof window !== "undefined" ? localStorage : undefined,
    },
  }
);