// app/api/calendar-posts/route.ts (Next.js App Router 기준)
import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/route-helpers'

type ItemType = 'hosting' | 'following' | 'member' | 'none'

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
    // 1) posts에서 room_id + id 둘 다 가져온다
    const { data: postRows } = await supabase
      .from('posts')
      .select('id, room_id');

    const postsMap = new Map<string, string>(); 
    // key: room_id, value: post.id

    postRows?.forEach((p) => {
      postsMap.set(p.room_id, p.id);
    });

    const roomIds = Array.from(postsMap.keys());

    // 2) participants에서 “member + 내 user_id + room_id 목록” 필터링
    const { data: myJoins } = await supabase
      .from('participants')
      .select('room_id')
      .eq('role', 'member')
      .eq('user_id', user.id)
      .in('room_id', roomIds);

    // 3) 참가한 방의 posts.id 를 Set에 추가
    myJoins?.forEach((row) => {
      const postId = postsMap.get(row.room_id);
      if (postId) {
        joinedPostIds.add(postId);
      }
    });
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

      const type:ItemType = isAuthor
        ? 'hosting'
        : hasJoined
        ? 'member'
        : isFollowing
        ? 'following'
        : 'none'
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