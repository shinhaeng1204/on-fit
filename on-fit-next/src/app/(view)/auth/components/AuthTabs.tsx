//components/auth/AuthTabs.tsx
'use client'

import { useEffect, useMemo, useState } from "react"
import { Input } from "@/components/common/Input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/common/Card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/common/Tabs"
import { Button } from "@/components/common/Button"
import { KakaoLoginButton, GoogleLoginButton } from "@/app/(view)/auth/components/OAuthButtons"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { api } from "@/lib/axios"
import { mutate } from "swr"
import { z } from "zod"
import Link from "next/link"
import { sbClient } from "@/lib/supabase-client"

type Props = {
  initialTab: "login" | "signup"
  initialNotice: string | null
}

const loginSchema = z.object({
  email: z.string().email('이메일 형식이 올바르지 않아요.'),
  password: z.string().min(6, '비밀번호는 6자 이상이어야 해요.'),
})

const signupSchema = z.object({
  email: z.string().email('이메일 형식이 올바르지 않아요.'),
  password: z.string().min(6, '비밀번호는 6자 이상이어야 해요.'),
  confirm: z.string(),
}).refine((v) => v.password === v.confirm, {
  path: ['confirm'],
  message: '비밀번호가 일치하지 않습니다.',
})

function normalizeAuthError(msg?: string) {
  if (!msg) return '요청을 처리하지 못했어요. 잠시 후 다시 시도해 주세요.'
  if (/Invalid login credentials/i.test(msg)) return '계정이 없거나 비밀번호가 올바르지 않습니다.'
  if (/email not confirmed/i.test(msg)) return '이메일 인증이 필요합니다. 메일함을 확인해 주세요.'
  if (/Email address ".+?" is invalid/i.test(msg) || /invalid email/i.test(msg)) return '이메일 형식이 올바르지 않습니다.'
  if (/user already registered/i.test(msg)) return '이미 가입된 이메일입니다.'
  if (/signup requires a valid email/i.test(msg)) return '유효한 이메일 주소가 필요합니다.'
  if (/Password should be at least/i.test(msg)) return '비밀번호는 6자 이상이어야 합니다.'
  if (/invalid password/i.test(msg)) return '비밀번호 형식이 올바르지 않습니다.'
  if (/too many requests|rate limit/i.test(msg)) return '요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.'
  if (/network/i.test(msg)) return '네트워크 오류가 발생했어요. 연결을 확인해 주세요.'
  if (/server|internal/i.test(msg)) return '서버 오류가 발생했어요. 잠시 후 다시 시도해 주세요.'
  return msg
}

export default function AuthTabs({ initialTab, initialNotice }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const sp = useSearchParams()
  const next = sp.get("next") || "/"

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [signupError, setSignupError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(initialNotice)

  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  const [signupEmail, setSignupEmail] = useState('')
  const [signupPw, setSignupPw] = useState('')
  const [signupPwConfirm, setSignupPwConfirm] = useState('')

  const tabFromURL = useMemo(() => {
    const t = sp.get('tab')
    return t === 'signup' ? 'signup' : 'login'
  }, [sp])

  const [tab, setTab] = useState<'login' | 'signup'>(initialTab)

  useEffect(() => {
    // URL이 바뀌면 탭도 동기화
    setTab(tabFromURL)
  }, [tabFromURL])

  const handleTabChange = (next: string) => {
    const q = new URLSearchParams(sp.toString())
    q.set('tab', next)
    router.replace(`${pathname}?${q.toString()}`)
    setTab(next as 'login' | 'signup')
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    if (isLoading) return
    setIsLoading(true)
    setError(null)
    setNotice(null)

    const r = loginSchema.safeParse({
      email: loginEmail.trim(),
      password: loginPassword,
    })
    if (!r.success) {
      setIsLoading(false)
      setError(r.error.issues[0].message)
      return
    }

    try {
      // 1) 클라이언트 Supabase 로그인
      const { data, error } = await sbClient.auth.signInWithPassword({
        email: r.data.email,
        password: r.data.password,
      })

      if (error) {
        if (error.code === "email_not_confirmed") {
          setError("이메일 인증이 완료되지 않았습니다. 메일을 확인해주세요.");
          return;
        }

        if (error.code === "invalid_credentials") {
          setError("이메일 또는 비밀번호가 잘못되었습니다.");
          return;
        }

        setError("로그인 실패");
        return;
      }

      if (!data.session) {
        setError("로그인 세션 생성에 실패했습니다. (인증 문제 가능)");
        return;
      }

      // 2) 서버에 세션 쿠키 굽기
      await fetch("/api/auth/cookie", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
          expires_at: data.session.expires_at,
        }),
      })
      await sbClient.auth.setSession(data.session);

      // 3) 상태 동기화
      await mutate("/api/auth/me")

      // 4) 체크 페이지로
      router.push(`/auth/check?next=${encodeURIComponent(next)}`)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true);
    setSignupError(null);
    setNotice(null);

    const r = signupSchema.safeParse({
      email: signupEmail.trim(),
      password: signupPw,
      confirm: signupPwConfirm,
    });

    if (!r.success) {
      setIsLoading(false);
      setSignupError(r.error.issues[0].message);
      return;
    }

    try {
      const { data, error } = await sbClient.auth.signUp({
        email: r.data.email,
        password: r.data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/confirm`,
        },
      });

      if (error) {
        // 이메일 중복
        if (error.message.includes("already registered")) {
          setSignupError("이미 가입된 이메일입니다.");
          return;
        }
        setSignupError("회원가입 중 오류가 발생했습니다.");
        return;
      }

      setTab("login");
      setNotice(`회원가입이 완료됐어요. ${r.data.email}을 열고 인증 버튼을 눌러주세요.`);

      const q = new URLSearchParams(sp.toString());
      q.set("tab", "login");
      q.set("notice", "verify");
      router.replace(`${pathname}?${q.toString()}`);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Tabs value={tab} onValueChange={handleTabChange} className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="login">로그인</TabsTrigger>
        <TabsTrigger value="signup">회원가입</TabsTrigger>
      </TabsList>

      <TabsContent value="login">
        <Card className="border-primary/20">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">로그인</CardTitle>
            <CardDescription>이메일과 비밀번호로 로그인하세요</CardDescription>
          </CardHeader>

          {(notice || error) && (
            <div
              className={`mx-6 mb-2 rounded-md px-3 py-2 text-sm ${
                notice
                  ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                  : 'bg-destructive/10 text-destructive border border-destructive/30'
              }`}
            >
              {notice ?? error}
            </div>
          )}

          <form onSubmit={handleLogin} noValidate>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="login-email">이메일</label>
                <Input
                  id="login-email"
                  type="text" inputMode="email"
                  placeholder="name@example.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <label htmlFor="login-password">비밀번호</label>
                        <Link href="/auth/forgot" className="text-xs text-primary hover:underline cursor-pointer">
                                비밀번호 재설정
                        </Link>
                </div>
                <Input
                  id="login-password"
                  type="password"
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row gap-2">
              <Button type="submit" className="w-full sm:w-auto flex-1" variant="hero" disabled={isLoading}>
                {isLoading ? "로딩중" : "로그인"}
              </Button>
              <KakaoLoginButton next={next} className="w-full sm:w-auto flex-1" />
              <GoogleLoginButton next={next} className="w-full sm:w-auto flex-1" />
            </CardFooter>
          </form>
        </Card>
      </TabsContent>

      <TabsContent value="signup">
        <Card className="border-primary/20">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">회원가입</CardTitle>
            <CardDescription>새 계정을 만들어보세요</CardDescription>
          </CardHeader>

          {signupError && (
            <div className="mx-6 mb-2 rounded-md px-3 py-2 text-sm bg-destructive/10 text-destructive border border-destructive/30">
              {signupError}
            </div>
          )}

          <form onSubmit={handleSignup} noValidate>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="signup-email">이메일</label>
                <Input
                  id="signup-email"
                  type="text" inputMode="email"
                  placeholder="name@example.com"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="signup-password">비밀번호</label>
                <Input
                  id="signup-password"
                  type="password"
                  placeholder="••••••••"
                  value={signupPw}
                  onChange={(e) => setSignupPw(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="signup-password-confirm">비밀번호 확인</label>
                <Input
                  id="signup-password-confirm"
                  type="password"
                  placeholder="••••••••"
                  value={signupPwConfirm}
                  onChange={(e) => setSignupPwConfirm(e.target.value)}
                  required
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" variant="hero" disabled={isLoading}>
                {isLoading ? "가입 중..." : "회원가입"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </TabsContent>
    </Tabs>
  )
}