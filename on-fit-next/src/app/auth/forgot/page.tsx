// app/auth/forgot/page.tsx (변경된 부분 위주)
import { createSupabaseServerClient } from "@/lib/route-helpers";
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/common/Card'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import Link from 'next/link'
import { ArrowLeft, CheckCircle } from 'lucide-react' // ✅ 아이콘 추가

const emailSchema = z.object({ email: z.string().email('이메일 형식이 올바르지 않습니다.') })

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}


export default async function ForgotPage({ searchParams }: Props) {
    const sp = await searchParams
  const sent = sp?.sent === '1'
  const error = typeof sp?.error === 'string' ? sp!.error : null
  const emailEchoRaw = typeof sp?.email === 'string' ? sp!.email : ''
  const emailEcho = decodeURIComponent(emailEchoRaw) // ✅ 퍼센트 인코딩 해제

  async function sendReset(formData: FormData) {
    'use server'

    const supabase = await createSupabaseServerClient()

    const email = String(formData.get('email') ?? '').trim()
    const parsed = emailSchema.safeParse({ email })
    if (!parsed.success) redirect(`/auth/forgot?error=invalid_email`)

    const { data: userInProfile, error: profileErr } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", email)
      .maybeSingle()

    if (!userInProfile) {
      redirect(`/auth/forgot?error=not_found&email=${encodeURIComponent(email)}`)
    }

    const h = headers()
    const proto = (await h).get('x-forwarded-proto') ?? 'http'
    const host = ((await h).get('x-forwarded-host') ?? (await h).get('host'))!
    const origin = `${proto}://${host}`
    const redirectTo = `${origin}/auth/reset?next=/auth/new-password`

    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo })
    if (error) redirect(`/auth/forgot?error=send_failed`)

    redirect(`/auth/forgot?sent=1&email=${encodeURIComponent(email)}`)
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-border/50 shadow-lg">
        <CardHeader className="space-y-2">
          <Link href="/auth" className="inline-flex w-fit">
            <Button
              variant="ghost"
              size="sm"
              className="!px-2 cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              로그인으로 돌아가기
            </Button>
          </Link>

          <CardTitle className="text-2xl font-bold bg-gradient-brand bg-clip-text text-transparent">
            비밀번호 재설정
          </CardTitle>
          <CardDescription>
            가입하신 이메일 주소를 입력하시면 비밀번호 재설정 링크를 보내드립니다
          </CardDescription>
        </CardHeader>

        <CardContent>
          {(sent || error) && (
            <div
              aria-live="polite" // ✅ 화면낭독 보조
              className={`mb-4 rounded-md px-3 py-2 text-sm ${
                sent
                  ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                  : 'bg-destructive/10 text-destructive border border-destructive/30'
              }`}
            >
              {sent ? (
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 mt-0.5" />
                  <p>
                    <strong>{emailEcho}</strong> 로 재설정 메일을 보냈어요. 메일함을 확인해 주세요.
                  </p>
                </div>
              ) : error === 'invalid_email' ? (
                '이메일 형식이 올바르지 않습니다.'
              ) : error === 'not_found' ? (
                '가입되어 있지 않은 이메일입니다.'
              ) : (
                '메일 발송에 실패했어요. 잠시 후 다시 시도해 주세요.'
              )}
            </div>
          )}

          <form action={sendReset} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm">
                이메일
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="your@email.com"
                defaultValue={emailEcho}
                required
                className="bg-background"
                disabled={sent} // ✅ 전송 후 잠시 비활성화(원하면 제거)
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-brand hover:opacity-90 text-white font-semibold cursor-pointer"
              disabled={sent} // ✅ 전송 후 버튼 비활성화(원하면 제거)
            >
              {sent ? '재설정 링크 전송됨' : '재설정 링크 보내기'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}