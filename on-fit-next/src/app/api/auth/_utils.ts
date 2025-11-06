import { NextResponse } from 'next/server'
import type { Session } from '@supabase/supabase-js'

export function setAuthCookies(res: NextResponse, session: Session) {
  const accessExp = session.expires_at
    ? new Date(session.expires_at * 1000)
    : new Date(Date.now() + 3600_000) // 1h
  const refreshExp = new Date(Date.now() + 30 * 24 * 3600_000) // 30d

  const isProd = process.env.NODE_ENV === 'production'

  res.cookies.set('sb-access-token', session.access_token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProd,
    path: '/',
    expires: accessExp,
  })
  res.cookies.set('sb-refresh-token', session.refresh_token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProd,
    path: '/',
    expires: refreshExp,
  })
}

export function clearAuthCookies(res: NextResponse) {
  const isProd = process.env.NODE_ENV === 'production'
  res.cookies.set('sb-access-token', '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProd,
    path: '/',
    expires: new Date(0),
  })
  res.cookies.set('sb-refresh-token', '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProd,
    path: '/',
    expires: new Date(0),
  })
}
