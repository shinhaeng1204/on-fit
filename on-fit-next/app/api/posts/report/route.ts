import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from '@/lib/route-helpers';

export async function POST(req: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
  const supabase = await createSupabaseServerClient();

  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("sb-access-token")?.value;

    if (!accessToken) {
      return NextResponse.json({ error: "로그인 후 이용할 수 있습니다." }, { status: 401 });
    }

    // 유저 조회
    const authClient = createClient(url, anonKey);
    const { data: userData } = await authClient.auth.getUser(accessToken);
    const user = userData?.user;

    if (!user) {
      return NextResponse.json({ error: "유저 정보를 불러올 수 없습니다." }, { status: 401 });
    }

    // 입력 데이터
    let { postId, targetUserId, roomId, reason, details } = await req.json();

    if (!reason || (!postId && !roomId)) {
      return NextResponse.json({ error: '필수 값이 존재하지 않습니다.' }, { status: 400 });
    }

    // ---------------------------------------------------
    // 🔄 1) roomId만 있을 때 → postId 가져오기
    // ---------------------------------------------------
    if (!postId && roomId) {
      const { data: room } = await supabase
        .from("rooms")
        .select("post_id")
        .eq("id", roomId)
        .maybeSingle();

      postId = room?.post_id ?? null;
    }

    // ---------------------------------------------------
    // 🔄 2) postId만 있을 때 → roomId 가져오기
    // ---------------------------------------------------
    if (!roomId && postId) {
      const { data: post } = await supabase
        .from("posts")
        .select("room_id")
        .eq("id", postId)
        .maybeSingle();

      roomId = post?.room_id ?? null;
    }
    console.log(postId, roomId)


    // 둘 다 못 찾으면 잘못된 요청
    if (!postId || !roomId) {
      return NextResponse.json(
        { error: 'postId 또는 roomId를 확인할 수 없습니다.' },
        { status: 400 }
      );
    }

    // ---------------------------------------------------
    // 🔎 3) 이미 신고했는지 확인 (postId + roomId 둘 다 고려)
    // ---------------------------------------------------
    const { data: exists } = await supabase
      .from("reports")
      .select("id")
      .eq("reporter_id", user.id)
      .eq("post_id", postId)
      .maybeSingle();

    if (exists) {
      return NextResponse.json(
        { error: "이미 신고한 내역이 있습니다." },
        { status: 400 }
      );
    }

    // ---------------------------------------------------
    // 📝 4) 신고 등록
    // ---------------------------------------------------
    const insertData: any = {
      reporter_id: user.id,
      post_id: postId,
      room_id: roomId,
      reason,
      details,
    };

    if (targetUserId) insertData.target_user_id = targetUserId;

    const { error } = await supabase.from("reports").insert(insertData);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { message: '신고가 접수되었습니다.' },
      { status: 201 }
    );

  } catch (e) {
    console.error('서버 에러:', e);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
