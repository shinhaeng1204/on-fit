'use server';

import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient } from '@/lib/route-helpers';



/** 🔹 닉네임 (직접 호출 버전 — ProfileHeader.tsx 에서 사용) */
export async function updateNicknameDirect(nextName: string) {
  // 서버 액션에서는 'use server'를 중복 선언하지 않아도 됨 (파일 상단에 있음)
  const nickname = nextName?.trim();
  if (!nickname) return { nickname: nextName };

  const supabase = await createSupabaseServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw new Error('Unauthorized');

  const { error } = await supabase
    .from('profiles')
    .update({ nickname })
    .eq('id', user.id);

  if (error) throw new Error(error.message);

  revalidatePath('/mypage');
  return { nickname };
}


/** 🔹 지역 업데이트 (직접 호출 버전 — RegionSection.tsx 에서 사용) */
export async function updateRegionDirect(nextRegion: string) {
  const location = nextRegion?.trim();
  if (!location) {
    // 빈 문자열이면 그냥 기존 값 유지하도록 early return
    return { location: nextRegion };
  }

  const supabase = await createSupabaseServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw new Error('Unauthorized');

  const { error } = await supabase
    .from('profiles')
    .update({ location }) // ✅ DB 컬럼 이름은 기존 코드에 맞춰서 location 사용
    .eq('id', user.id);

  if (error) throw new Error(error.message);

  revalidatePath('/mypage');
  return { location };
}



/** 🔹 선호 운동 (체크박스 or 태그 에디터 전용, 배열 직접) */
export async function updatePreferencesArray(nextList: string[]) {
  const list = (nextList ?? []).map(s => s.trim()).filter(Boolean);

  const supabase = await createSupabaseServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw new Error('Unauthorized');

  const { error } = await supabase
    .from('profiles')
    .update({ sport_preference: list })
    .eq('id', user.id);

  if (error) throw new Error(error.message);

  revalidatePath('/mypage');
  return { success: true, count: list.length };
}
