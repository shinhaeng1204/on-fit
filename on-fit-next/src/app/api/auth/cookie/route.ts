// app/api/auth/cookie/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { access_token, refresh_token, expires_at } = await req.json()

  if (!access_token || !refresh_token) {
    return NextResponse.json({ ok: false, error: 'TOKEN_MISSING' }, { status: 400 })
  }

  const res = NextResponse.json({ ok: true })
  const isProd = process.env.NODE_ENV === 'production'

  res.cookies.set('sb-access-token', access_token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProd,
    path: '/',
    expires: expires_at ? new Date(expires_at * 1000) : new Date(Date.now() + 3600_000),
  })
  res.cookies.set('sb-refresh-token', refresh_token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProd,
    path: '/',
    expires: new Date(Date.now() + 30 * 24 * 3600_000),
  })

  return res
}
