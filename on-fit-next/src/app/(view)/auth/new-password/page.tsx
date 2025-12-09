// app/auth/new-password/page.tsx
import { redirect } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/common/Card'
import { Input } from '@/components/common/Input'
import { Button } from '@/components/common/Button'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createSupabaseServerClient } from '@/lib/route-helpers' // 여기 추가

type PageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> }

export default async function NewPasswordPage({ searchParams }: PageProps) {
  const sp = await searchParams
  const errorMsg = typeof sp.error === 'string' ? decodeURIComponent(sp.error) : null

  async function changePassword(formData: FormData) {
    'use server'

    //  공통 헬퍼 사용 (cookies 직접 만지지 않음)
    const supabase = await createSupabaseServerClient()

    // 세션 확인 (reset 페이지에서 쿠키를 못 굽고 왔으면 여기서 걸림)
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      redirect('/auth?tab=login&error=reset_session_missing')
    }

    const pw = String(formData.get('password') ?? '').trim()
    const confirm = String(formData.get('confirm') ?? '').trim()

    if (pw.length < 6) {
      redirect(`/auth/new-password?error=${encodeURIComponent('비밀번호는 6자 이상이어야 합니다.')}`)
    }

    if (pw !== confirm) {
      redirect(`/auth/new-password?error=${encodeURIComponent('비밀번호가 일치하지 않습니다.')}`)
    }

    const { error } = await supabase.auth.updateUser({ password: pw })
    if (error) {
      redirect(
        `/auth/new-password?error=${encodeURIComponent(
          '비밀번호 변경에 실패했어요. 잠시 후 다시 시도해주세요'
        )}`
      )
    }

    // 완료 후 로그인 화면으로
    redirect('/auth?tab=login&notice=pw_reset_ok')
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-border/50 shadow-lg">
        <CardHeader className="space-y-2">
          <Link
            href="/auth"
            className="w-fit -ml-2 mb-2 inline-flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>로그인으로 돌아가기</span>
          </Link>
          <CardTitle className="text-2xl font-bold">새 비밀번호 설정</CardTitle>
          <CardDescription>
            이메일 링크를 통해 도착하셨다면 새 비밀번호를 입력해 주세요.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {errorMsg && (
            <div className="mb-4 rounded-md px-3 py-2 text-sm bg-destructive/10 text-destructive border border-destructive/30">
              {errorMsg}
            </div>
          )}

          <form action={changePassword} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm">
                새 비밀번호
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                minLength={6}
                className="bg-background"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="confirm" className="text-sm">
                비밀번호 확인
              </label>
              <Input
                id="confirm"
                name="confirm"
                type="password"
                placeholder="••••••••"
                required
                minLength={6}
                className="bg-background"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-gradient-brand hover:opacity-90 text-white font-semibold"
            >
              비밀번호 변경
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
