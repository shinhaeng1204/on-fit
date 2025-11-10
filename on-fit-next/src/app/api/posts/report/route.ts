import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies()
    const accessToken = cookieStore.get('sb-access-token')?.value

    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized: token missing' }, { status: 401 })
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false },
    })

    const { data: user, error: userError } = await supabase.auth.getUser(accessToken)

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { postId, targetUserId, reason, details } = await req.json()
    if (!postId || !reason) {
      return NextResponse.json({ error: '필수 값이 존재하지 않습니다.' }, { status: 400 })
    }

    console.log(user)

    const { error } = await supabase.from('reports').insert({
      reporter_id: user.id,
      post_id: postId,
      target_user_id: targetUserId,
      reason,
      details,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: '신고가 접수되었습니다.' }, { status: 201 })
  } catch (e) {
    console.error('서버 에러:', e)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
