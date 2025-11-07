'use client'
import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/common/Input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/common/Card";
import Link from "next/link";
import { ArrowLeft, UserRound } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/common/Tabs"
import { Button } from "@/components/common/Button";
import { KakaoLoginButton, GoogleLoginButton } from "@/components/auth/OAuthButtons";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/axios";
import { mutate } from "swr";
import {z} from 'zod'
const loginSchema = z.object({
  email: z.string().email('이메일 형식이 올바르지 않아요.'),
  password: z.string().min(6, '비밀번호는 6자 이상이어야 해요.'),
})

const signupSchema = z.object({
  email: z.string().email('이메일 형식이 올바르지 않아요.'),
  password: z.string().min(6, '비밀번호는 6자 이상이어야 해요.'),
  confirm: z.string(),
}).refine((v)=> v.password === v.confirm, {
  path: ['confirm'],
  message: '비밀번호가 일치하지 않습니다.',
})

function normalizeAuthError(msg?: string) {
  if (!msg) return '요청을 처리하지 못했어요. 잠시 후 다시 시도해 주세요.'

  // ─── 로그인 공통 ─────────────────────────────────────────────
  if (/Invalid login credentials/i.test(msg))
    return '계정이 없거나 비밀번호가 올바르지 않습니다.'
  if (/email not confirmed/i.test(msg))
    return '이메일 인증이 필요합니다. 메일함을 확인해 주세요.'

  // ─── 회원가입/이메일 관련 ───────────────────────────────────
  if (/Email address ".+?" is invalid/i.test(msg))
    return '이메일 형식이 올바르지 않습니다.'
  if (/invalid email/i.test(msg))
    return '이메일 형식이 올바르지 않습니다.'
  if (/user already registered/i.test(msg))
    return '이미 가입된 이메일입니다.'
  if (/signup requires a valid email/i.test(msg))
    return '유효한 이메일 주소가 필요합니다.'

  // ─── 비밀번호 관련 ──────────────────────────────────────────
  if (/Password should be at least/i.test(msg))
    return '비밀번호는 6자 이상이어야 합니다.'
  if (/invalid password/i.test(msg))
    return '비밀번호 형식이 올바르지 않습니다.'

  // ─── 기타/제한 ─────────────────────────────────────────────
  if (/too many requests|rate limit/i.test(msg))
    return '요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.'
  if (/network/i.test(msg))
    return '네트워크 오류가 발생했어요. 연결을 확인해 주세요.'
  if (/server|internal/i.test(msg))
    return '서버 오류가 발생했어요. 잠시 후 다시 시도해 주세요.'

  return msg
}


export default function Page(){
  const router = useRouter()
  const pathname = usePathname()
  const sp = useSearchParams()

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null)
  const [sinuperror, setSignuperror] = useState<string| null>(null)
  const [notice, setNotice] = useState<string | null>(sp.get('notice') ?? null)

  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  const [signupEmail, setSignupEmail] = useState('')
  const [signupPw, setSignupPw] = useState('')
  const [signupPwConfirm, setSignupPwConfirm] = useState('')

  const tabFromURL = useMemo(()=>{
    const t = sp.get('tab')
    return t === 'signup'?'signup':'login'
  }, [sp])

  const [tab, setTab] = useState<'login' | 'signup'>(tabFromURL)

  useEffect(()=>{
    setTab(tabFromURL)
  }, [tabFromURL])

  // 탭을 바꾸면 URL도 같이 업데이트 (새로고침해도 같은 탭 유지)
  const handleTabChange = (next: string) => {
    const q = new URLSearchParams(sp.toString())
    q.set('tab', next)
    router.replace(`${pathname}?${q.toString()}`) // history 덮어쓰기 원하면 replace, 아니면 push
    setTab(next as 'login' | 'signup')
  }



  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if(isLoading) return
    setIsLoading(true)
    setError(null)
    setNotice(null)

    const r = loginSchema.safeParse({email:loginEmail.trim(), password:loginPassword})
    if(!r.success){
      setIsLoading(false)
      setError(r.error.issues[0].message)
      return
    }
    try{
      await api.post('/api/auth/login', {
        email: r.data.email,
        password: r.data.password,
      })
      await mutate('/api/auth/me')
      router.push('/')
    } catch(err:any){
      setError(normalizeAuthError(err.response?.data?.error))
    } finally {
      setIsLoading(false)
    }
    
  };

  async function handleSignup(e:React.FormEvent){
    e.preventDefault()
    if(isLoading) return
    setIsLoading(true)
    setSignuperror(null)
    setNotice(null)

    const r = signupSchema.safeParse({
      email: signupEmail.trim(),
      password: signupPw,
      confirm: signupPwConfirm,
    })
    if(!r.success){
      setIsLoading(false)
      setSignuperror(r.error.issues[0].message)
      return
    }
    const {email, password} = r.data
    try {
      await api.post('/api/auth/signup', { email, password })
      setTab('login')
      setNotice('회원가입이 완료됐어요. 이메일을 열고 인증 버튼을 눌러주세요.')
      const q = new URLSearchParams(sp.toString())
      q.set('tab', 'login')
      q.set('notice', 'verify')
      router.replace(`${pathname}?${q.toString()}`)
    } catch(err:any){
      setSignuperror(normalizeAuthError(err.response?.data?.error))
    } finally {
      setIsLoading(false)
    }
  }



  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-subtle p-4">
      <div className="w-full max-w-md space-y-4">
        <Link href={"/"} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" />
          홈으로 돌아가기
        </Link>

        <Tabs value={tab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">로그인</TabsTrigger>
            <TabsTrigger value="signup">회원가입</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <Card className="border-primary/20">
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold">로그인</CardTitle>
                <CardDescription>
                  이메일과 비밀번호로 로그인하세요
                </CardDescription>
              </CardHeader>
              {(notice || error) && (
                <div className={`mx-6 mb-2 rounded-md px-3 py-2 text-sm ${notice ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30' : 'bg-destructive/10 text-destructive border border-destructive/30'}`}>
                  {notice ?? error}
                </div>
              )}
              <form onSubmit={handleLogin}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="login-email">이메일</label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="name@example.com"
                      value={loginEmail}
                      onChange={(e)=>setLoginEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="login-password">비밀번호</label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      value = {loginPassword}
                      onChange={(e)=>setLoginPassword(e.target.value)}
                      required
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    type="submit"
                    className="w-full"
                    variant="hero"
                    disabled={isLoading}
                  >
                    {isLoading ? "로그인 중..." : "로그인"}
                  </Button>
                  <KakaoLoginButton />
                  <GoogleLoginButton />
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          <TabsContent value="signup">
            <Card className="border-primary/20">
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold">회원가입</CardTitle>
                <CardDescription>
                  새 계정을 만들어보세요
                </CardDescription>
              </CardHeader>
              {(sinuperror) && (
                <div className="mx-6 mb-2 rounded-md px-3 py-2 text-sm bg-destructive/10 text-destructive border border-destructive/30">
                  {sinuperror}
                </div>
              )}
              <form onSubmit={handleSignup}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="signup-email">이메일</label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="name@example.com"
                      value={signupEmail}
                      onChange={(e)=>setSignupEmail(e.target.value)}
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
                      onChange={(e)=>setSignupPw(e.target.value)}
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
                      onChange={(e)=>setSignupPwConfirm(e.target.value)}
                      required
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    type="submit"
                    className="w-full"
                    variant="hero"
                    disabled={isLoading}
                  >
                    {isLoading ? "가입 중..." : "회원가입"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

