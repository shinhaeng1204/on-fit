// app/api/calendar-posts/route.ts (Next.js App Router 기준)
import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/route-helpers'

type ItemType = 'hosting' | 'following' | 'member'

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

    let followingSet = new Set<string>();
    if (user?.id) {
    const { data: me } = await supabase
        .from('profiles')
        .select('following')
        .eq('id', user.id)
        .single();

    if (Array.isArray(me?.following)) {
        // ✅ 문자열로 정규화
        followingSet = new Set(me.following.map((v: any) => String(v)));
    }
    }

    let joinedPostIds = new Set<string>();
    if (user?.id) {
    const { data: myJoins } = await supabase
        .from('participants')
        .select('post_id')
        .eq('user_id', user.id);

    if (Array.isArray(myJoins)) {
        // ✅ 문자열로 정규화
        joinedPostIds = new Set(myJoins.map(r => String(r.post_id)));
    }
    }
  
  const { data, error } = await supabase
    .from('posts')
    .select('id, title, sport, date_time, author_id')  
    .gte('date_time', fromISO)             
    .lt('date_time', toISO)                
    .order('date_time', { ascending: true })

  if (error) return NextResponse.json({ ok:false, code:'LIST_FAILED', message:error.message }, { status:500 })
    
    const items = (data ?? []).map((p: any) => {
    const pid = String(p.id);
    const authorId = String(p.author_id);
    const isAuthor = authorId === String(user?.id);
    const hasJoined = joinedPostIds.has(pid);
    const isFollowing = followingSet.has(authorId);

    // ✅ 우선순위: hosting > member > following > (기본) member
    const type: ItemType = isAuthor
        ? 'hosting'
        : hasJoined
        ? 'member'
        : isFollowing
        ? 'following'
        : 'member';
    return {
        id: p.id as string,
        title: p.title ?? '',
        sport: p.sport ?? '기타',
        date: p.date_time as string, // ISO 문자열
        type,
    }
  })

  return NextResponse.json({ ok:true, items })
}