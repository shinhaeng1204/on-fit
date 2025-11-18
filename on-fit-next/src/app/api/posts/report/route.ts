import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import {createClient} from "@supabase/supabase-js";
import { createSupabaseServerClient } from '@/lib/route-helpers';

export async function POST(req: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
    const supabase = await createSupabaseServerClient();

  try {
    const cookieStore = await cookies()
    const accessToken = cookieStore.get("sb-access-token")?.value

    if (!accessToken) {
      return NextResponse.json({ error: "로그인 후 이용할 수 있습니다." }, { status: 401 })
    }

    const authClient = createClient(url, anonKey)
    const { data: userData, error: userError } = await authClient.auth.getUser(accessToken)

    if (userError || !userData?.user) {
      console.error("Invalid user token:", userError)
      return NextResponse.json({ error: "유저 정보를 불러올 수 없습니다." }, { status: 401 })
    }

    const user = userData.user

    const { postId, targetUserId, reason, details } = await req.json()
    if (!postId || !reason) {
      return NextResponse.json({ error: '필수 값이 존재하지 않습니다.' }, { status: 400 })
    }

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
