'use client'
import { useState } from "react";
import { Input } from "@/components/common/Input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/common/Card";
import Link from "next/link";
import { ArrowLeft, UserRound } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/common/Tabs"
import { Button } from "@/components/common/Button";
import { KakaoLoginButton, GoogleLoginButton } from "@/components/auth/OAuthButtons";
import { useRouter } from "next/navigation";
import { api } from "@/lib/axios";
import { mutate } from "swr";

export default function Page(){
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null)

  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  const [signupEmail, setSignupEmail] = useState('')
  const [signupPw, setSignupPw] = useState('')
  const [signupPwConfirm, setSignupPwConfirm] = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if(isLoading) return
    setIsLoading(true)
    setError(null)
    try{
      await api.post('/api/auth/login', {
        email: loginEmail.trim(),
        password: loginPassword,
      })
      await mutate('/api/auth/me')
      router.push('/')
    } catch(err:any){
      setError(err.response?.data?.error || '로그인에 실패했어요.')
    } finally {
      setIsLoading(false)
    }
    
  };

  async function handleSignup(e:React.FormEvent){
    e.preventDefault()
    if(isLoading) return
    if(signupPw !== signupPwConfirm){
      setError('비밀번호가 일치하지 않습니다.')
      return
    }
    setIsLoading(true)
    setError(null)
    try {
      await api.post('/api/auth/signup', {
        email: signupEmail.trim(),
        password: signupPw,
      })
      router.refresh()
    } catch(err:any){
      setError(err.response?.data?.error || '회원가입에 실패했어요.')
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

        <Tabs defaultValue="login" className="w-full">
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

