// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(req: NextRequest) {
  console.log("🔥 Middleware running:", req.nextUrl.pathname);
  const url = req.nextUrl.clone();
  const refreshToken = req.cookies.get("sb-refresh-token")?.value;

  // 보호해야 하는 페이지들
  const protectedRoutes = ["/mypage", "/chat", "/calendar", "/post/create", "/review"];
  const isProtected = protectedRoutes.some((path) =>
    url.pathname.startsWith(path)
  );

  if (isProtected && !refreshToken) {
    url.pathname = "/auth";
    url.searchParams.set("next", req.nextUrl.pathname); // 리다이렉트 후 돌아오기
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}
export const config = {
  matcher: [
    "/((?!api|_next|favicon.ico).*)",
  ],
}; //matcher : 반드시 미들웨어가 동작해야 하는 경로만 선택해야함 즉, 미들웨어는 "웹페이지 라우팅"에만 적용되고, API나 정적 파일은 제외됨

