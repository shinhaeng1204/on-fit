'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/route-helpers';
import { PATHS } from '@/lib/paths';

/** 🔹 닉네임 (직접 호출 버전 — ProfileHeader.tsx 에서 사용) */
export async function updateNicknameDirect(nextName: string) {
  const nickname = nextName?.trim();
  if (!nickname) return { nickname: nextName };

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) throw new Error('Unauthorized');

  const { error } = await supabase
    .from('profiles')
    .update({ nickname })
    .eq('id', user.id);

  if (error) throw new Error(error.message);

  revalidatePath(PATHS.MYPAGE);
  return { nickname };
}

/** 🔹 지역 업데이트 (단일 문자열 버전 — 필요 시 사용, home_region만 변경) */
export async function updateRegionDirect(nextRegion: string) {
  const region = nextRegion?.trim();
  if (!region) {
    // 빈 문자열이면 기존 값 유지
    return { home_region: nextRegion };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) throw new Error('Unauthorized');

  const { error } = await supabase
    .from('profiles')
    .update({ home_region: region }) // ✅ location → home_region 으로 변경
    .eq('id', user.id);

  if (error) throw new Error(error.message);

  revalidatePath(PATHS.MYPAGE);
  return { home_region: region };
}

/** 🔹 마이페이지 전용 동네 설정 (/mypage/region 폼에서 사용) */
export async function updateRegionFromMyPage(formData: FormData) {
  const region = String(formData.get('region') ?? '').trim();
  const lat = Number(formData.get('lat') ?? 0);
  const lng = Number(formData.get('lng') ?? 0);

  if (!region || !lat || !lng) {
    throw new Error('동네 정보가 완전하지 않습니다.');
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error('로그인이 필요합니다.');
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      home_region: region,
      home_lat: lat,
      home_lng: lng,
      updated_at: new Date(),
    })
    .eq('id', user.id);

  if (error) {
    console.error(error);
    throw new Error('동네 설정 저장에 실패했습니다.');
  }

  // ✅ 마이페이지 캐시 지우고
  revalidatePath(PATHS.MYPAGE);
  // ✅ 저장 끝나면 바로 마이페이지로 이동 + 쿼리로 상태 전달
  redirect(`${PATHS.MYPAGE}?updated=region`);
}

/** 🔹 선호 운동 (체크박스 or 태그 에디터 전용, 배열 직접) */
export async function updatePreferencesArray(nextList: string[]) {
  const list = (nextList ?? []).map((s) => s.trim()).filter(Boolean);

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) throw new Error('Unauthorized');

  const { error } = await supabase
    .from('profiles')
    .update({ sport_preference: list })
    .eq('id', user.id);

  if (error) throw new Error(error.message);

  revalidatePath(PATHS.MYPAGE);
  return { success: true, count: list.length };
}

/** 🔹 프로필 이미지 업데이트 */
export async function updateProfileImage(imageUrl: string) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error('로그인이 필요합니다.');
  }

  const { error } = await supabase
    .from('profiles')
    .update({ profile_image: imageUrl })
    .eq('id', user.id);

  if (error) {
    console.error(error);
    throw new Error('프로필 이미지 업데이트에 실패했습니다.');
  }

  revalidatePath(PATHS.MYPAGE);
}
