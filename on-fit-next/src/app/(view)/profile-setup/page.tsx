// app/profile-setup/page.tsx  ← 서버 컴포넌트
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { Dumbbell, MapPin, User } from 'lucide-react' // ← lucide-react 아이콘 추가
import LocationSelector from './LocationSelector'

const EXERCISES = [
  '축구','농구','야구','배구','테니스',
  '배드민턴','탁구','러닝','등산','자전거',
  '수영','헬스','요가','필라테스','클라이밍'
]

export default async function ProfileSetup() {
  // 서버 액션: 폼 제출 처리
  async function saveProfile(formData: FormData) {
    'use server'

    const cookieStore = await cookies() // cookies()는 동기입니다
    const access = cookieStore.get('sb-access-token')?.value
    if (!access) redirect('/auth')

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { global: { headers: { Authorization: `Bearer ${access}` } } } // RLS 권한 위임
    )

    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser()
    if (userErr || !user) redirect('/auth')

    const nickname = String(formData.get('nickname') ?? '').trim()
    const location = String(formData.get('location') ?? '').trim()
    const sports = formData.getAll('sport_preference') as string[]

    if (!nickname || !location) {
      throw new Error('닉네임과 동네는 필수입니다.')
    }

    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        email: user.email ?? null,
        nickname,
        location,
        sport_preference: sports,
        updated_at: new Date(),
      })

    if (error) {
      throw new Error(error.message)
    }

    redirect('/')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center p-4">
      <form
        action={saveProfile} // ← 서버 액션으로 바로 제출
        className="w-full max-w-2xl"
      >
        <div className="rounded-xl border bg-card">
          <div className="p-6 text-center border-b">
            <h1 className="text-2xl font-semibold">프로필 설정</h1>
            <p className="text-sm text-muted-foreground mt-1">
              서비스를 시작하기 전에 프로필을 설정해주세요
            </p>
          </div>

          <div className="p-6 space-y-6">
            {/* 닉네임 */}
            <div className="space-y-2">
              <label htmlFor="nickname" className="flex items-center gap-2">
                <User className="w-4 h-4" /> {/* ← lucide-react 아이콘 */}
                닉네임
              </label>
              <input
                id="nickname"
                name="nickname"
                placeholder="닉네임을 입력하세요"
                className="w-full rounded-md border bg-background px-3 py-2"
                required
              />
            </div>

            {/* 동네 */}
            <div className="space-y-2">
              <label htmlFor="location" className="flex items-center gap-2">
                <MapPin className="w-4 h-4" /> {/* ← lucide-react 아이콘 */}
                나의 동네
              </label>
              <input type="hidden" name="location" id="location-input" />
              <LocationSelector />
            </div>

            {/* 선호 운동 (무JS 토글: checkbox + peer 스타일) */}
            <div className="space-y-3">
              <label className="flex items-center gap-2">
                <Dumbbell className="w-4 h-4" /> {/* ← lucide-react 아이콘 */}
                선호하는 운동
              </label>
              <p className="text-sm text-muted-foreground">
                관심있는 운동을 선택해주세요 (여러 개 선택 가능)
              </p>

              <div className="flex flex-wrap gap-2">
                {EXERCISES.map((ex) => {
                  const id = `ex-${ex}`
                  return (
                    <div key={ex} className="inline-block">
                      <input
                        id={id}
                        type="checkbox"
                        name="sport_preference"
                        value={ex}
                        className="peer sr-only"
                      />
                      <label
                        htmlFor={id}
                        className="select-none rounded-full border px-3 py-1 text-sm transition
                                   cursor-pointer hover:scale-105
                                   peer-checked:bg-primary peer-checked:text-primary-foreground peer-checked:border-primary"
                      >
                        {ex}
                      </label>
                    </div>
                  )
                })}
              </div>
            </div>

            <button
              type="submit"
              className="w-full rounded-md px-4 py-3 font-medium bg-primary text-primary-foreground hover:opacity-90 transition"
            >
              시작하기
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}