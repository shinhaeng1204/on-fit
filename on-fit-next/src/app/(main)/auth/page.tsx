'use client'
import { useState } from "react";
import { Input } from "@/components/common/Input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/common/Card";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/common/Tabs"
import { Button } from "@/components/common/Button";
import { KakaoLoginButton, GoogleLoginButton } from "@/components/auth/OAuthButtons";


export default function Page(){
    const [isLoading, setIsLoading] = useState(false);
    const client_id = process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID!
    const redirect_uri = process.env.NEXT_PUBLIC_KAKAO_REDIRECT_URI!
    const response_type = "code"
    const authParam = new URLSearchParams({
            client_id,
            redirect_uri,
            response_type
        })

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if(isLoading) return
    setIsLoading(true)
    
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // 디자인만 구현 - 실제 로직은 나중에
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

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
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="login-password">비밀번호</label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
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
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="signup-password">비밀번호</label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="signup-password-confirm">비밀번호 확인</label>
                    <Input
                      id="signup-password-confirm"
                      type="password"
                      placeholder="••••••••"
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

