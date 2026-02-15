import { createSupabaseServerClient } from "@/lib/route-helpers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { postId } = await req.json();

    if (!postId) {
      return NextResponse.json({ error: "Missing postId" }, { status: 400 });
    }

    const supabase = await createSupabaseServerClient();

    // 포스트 정보 가져오기
    const { data: post, error: postError } = await supabase
      .from("posts")
      .select("title, author_id")
      .eq("id", postId)
      .single();

    if (postError || !post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // 룸 생성
    const { data: room, error: roomError } = await supabase
      .from("rooms")
      .insert({
        name: post.title,
        post_id: postId,
        host_id: post.author_id,
        created_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (roomError) {
      return NextResponse.json({ error: roomError.message }, { status: 500 });
    }

    // 호스트를 기본 참여자로 등록
    const { error: participantError } = await supabase
      .from("participants")
      .insert({
        room_id: room.id,
        user_id: post.author_id,
        role: "host",
        joined_at: new Date().toISOString(),
      });

    if (participantError) {
      return NextResponse.json({ error: participantError.message }, { status: 500 });
    }

    // 포스트에 room_id 업데이트
    const { error: updateError } = await supabase
      .from("posts")
      .update({ room_id: room.id })
      .eq("id", postId);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ roomId: room.id }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}