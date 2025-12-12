// app/profile-setup/page.tsx
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import ProfileSetupClient from './ProfileSetupClient'

export default function ProfileSetupPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center p-4">
      <ProfileSetupClient saveProfile={saveProfile} />
    </div>
  )
}

// 🔥 서버 액션 (이 파일 안에 같이 있음)
async function saveProfile(formData: FormData) {
  'use server'

  const cookieStore = await cookies()
  const access = cookieStore.get('sb-access-token')?.value
  if (!access) redirect('/auth')

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: { headers: { Authorization: `Bearer ${access}` } },
    }
  )

  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser()

  if (userErr || !user) redirect('/auth')

  const nickname = String(formData.get('nickname') ?? '').trim()
  const region = String(formData.get('region') ?? '').trim()
  const lat = Number(formData.get('lat') ?? 0)
  const lng = Number(formData.get('lng') ?? 0)
  const sports = formData.getAll('sport_preference') as string[]

  if (!nickname || !region || !lat || !lng) {
    throw new Error('프로필 정보가 완전하지 않습니다.')
  }

  const { error } = await supabase.from('profiles').upsert({
    id: user.id,
    email: user.email ?? null,
    nickname,
    home_region: region,
    home_lat: lat,
    home_lng: lng,
    sport_preference: sports,
    updated_at: new Date(),
  })

  if (error) {
    throw new Error(error.message)
  }

}
