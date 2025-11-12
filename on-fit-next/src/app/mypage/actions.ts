'use server';

import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient } from '@/lib/route-helpers';

export async function updateNickname(formData: FormData) {
  const nickname = (formData.get('nickname') as string)?.trim();
  if (!nickname) return;

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { error } = await supabase
    .from('profiles')
    .update({ nickname })
    .eq('id', user.id);

  if (error) throw new Error(error.message);
  revalidatePath('/mypage');
}

export async function updateRegion(formData: FormData) {
  const location = (formData.get('location') as string)?.trim() ?? '';
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { error } = await supabase
    .from('profiles')
    .update({ location })
    .eq('id', user.id);

  if (error) throw new Error(error.message);
  revalidatePath('/mypage');
}

export async function updatePreferences(formData: FormData) {
  const raw = (formData.get('preferences') as string) ?? '';
  const list = raw.split(',').map(s => s.trim()).filter(Boolean);

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { error } = await supabase
    .from('profiles')
    .update({ sport_preference: list })
    .eq('id', user.id);

  if (error) throw new Error(error.message);
  revalidatePath('/mypage');
}
export async function updateNicknameDirect(nextName: string) {
  'use server';

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { error } = await supabase
    .from('profiles')
    .update({ nickname: nextName })
    .eq('id', user.id);

  if (error) throw new Error(error.message);
  
  revalidatePath('/mypage');
  
  return { nickname: nextName };
}
