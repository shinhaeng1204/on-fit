import { NextResponse } from 'next/server'
import { sbAdmin } from '@/lib/supabase-admin'

export async function POST(req: Request) {
  // ENV 체크 
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !service) {
    console.error(' ENV missing:', { url, service })
    return NextResponse.json(
      {
        ok: false,
        error: `ENV_MISSING: url=${!!url}, service=${!!service}. 
        Check .env.local and restart dev server.`,
      },
      { status: 500 }
    )
  }

  if (!/^https:\/\/.*\.supabase\.co/.test(url)) {
    console.error(' ENV_BAD_URL:', url)
    return NextResponse.json(
      { ok: false, error: `ENV_BAD_URL: ${url}` },
      { status: 500 }
    )
  }

  // 요청 Body 파싱
  let b: any
  try {
    b = await req.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'INVALID_JSON_BODY' }, { status: 400 })
  }

  // 필수값 검증
  if (!b.title || !b.sport || !b.location || !b.date || !b.time) {
    console.error(' Missing required fields:', b)
    return NextResponse.json({ ok: false, error: '필수값 누락' }, { status: 400 })
  }

  // 날짜 유효성 검사
  const dateObj = new Date(`${b.date}T${b.time}:00+09:00`)
  if (isNaN(dateObj.getTime())) {
    console.error(' Invalid date/time:', { date: b.date, time: b.time })
    return NextResponse.json({ ok: false, error: '잘못된 날짜/시간 형식' }, { status: 400 })
  }

  // Supabase 연결 테스트 (ping)
  try {
    const { error: pingErr } = await sbAdmin.from('posts').select('id').limit(1)
    if (pingErr) {
      console.error(' Supabase Ping Fail:', pingErr)
      return NextResponse.json({ ok: false, error: `PING_FAIL: ${pingErr.message}` }, { status: 500 })
    }
  } catch (err: any) {
    console.error(' Supabase Fetch Fail:', err)
    return NextResponse.json({ ok: false, error: `FETCH_FAIL: ${err.message}` }, { status: 500 })
  }

  // Insert 데이터 구성
  const insert = {
    sport: String(b.sport),
    title: String(b.title),
    location: String(b.location),
    date_time: dateObj.toISOString(),
    level: b.level ?? '브론즈',
    status: b.status ?? '모집중',
    current_participants: Number(b.currentParticipants ?? 1),
    max_participants: Math.max(1, Number(b.maxParticipants ?? 1)),
    author: b.author ?? '익명',
    description: b.description ?? '',
    equipment: b.equipment ?? '',
    fee: b.fee ?? '',
  }

  console.log(' Insert payload:', insert)

  // Supabase Insert 실행
  try {
    const { data, error } = await sbAdmin.from('Fit').insert(insert).select().single()

    if (error) {
      console.error(' Supabase Insert Error:', error)
      return NextResponse.json({ ok: false, error: error.message }, { status: 400 })
    }

    console.log('✅ Insert Success:', data)
    return NextResponse.json({ ok: true, item: data }, { status: 201 })
  } catch (err: any) {
    console.error(' Fetch failed:', err)
    return NextResponse.json({ ok: false, error: `TypeError: ${err.message}` }, { status: 400 })
  }
}

export async function GET() {
  const {data, error} = await sbAdmin
  .from('posts')
  .select('*')
  .order('created_at', {ascending: false})

  if(error) {
    return NextResponse.json({ok: false, error: error.message}, {status: 500})
  }

  return NextResponse.json({ok: true, items: data})
}