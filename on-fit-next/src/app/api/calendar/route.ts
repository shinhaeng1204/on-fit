// app/api/calendar-posts/route.ts (Next.js App Router 기준)
import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/route-helpers'

export async function GET(req: Request) {
  const supabase = await createSupabaseServerClient()

  const {data : {user}} = await supabase.auth.getUser()

  // 쿼리(from, to)가 없으면 "현재 달" 기본
  const url = new URL(req.url)
  const fromQ = url.searchParams.get('from')
  const toQ   = url.searchParams.get('to')

  const now = new Date()
  const fromISO = fromQ ?? new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const toISO   = toQ   ?? new Date(now.getFullYear(), now.getMonth()+1, 0, 23,59,59).toISOString()

  const { data, error } = await supabase
    .from('posts')
    .select('id, title, sport, date_time, author_id')  
    .gte('date_time', fromISO)             
    .lt('date_time', toISO)                
    .order('date_time', { ascending: true })

  if (error) return NextResponse.json({ ok:false, code:'LIST_FAILED', message:error.message }, { status:500 })

  // 프론트가 바로 쓸 수 있는 형태로 가공
  const items = (data ?? []).map((p: any) => ({
    id: p.id as string,
    title: p.title ?? '',
    sport: p.sport ?? '기타',
    date: p.date_time as string, // ISO 문자열
    type : p.author_id === user?.id ? "hosting" : "member" as const,
  }))

  return NextResponse.json({ ok:true, items })
}