"use client"

import { createBrowserClient } from "@supabase/ssr";

export const sbClient = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: false,      // ❗ 세션을 로컬스토리지에 저장하지 않음
      detectSessionInUrl: true,   // OAuth callback 처리
      storage: undefined          // ❌ 로컬스토리지 안 씀
    }
  }
);