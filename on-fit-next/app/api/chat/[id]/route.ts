import { createSupabaseServerClient } from "@/lib/route-helpers";
import { NextResponse } from "next/server";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_: Request, context: Ctx) {
  const params = await context.params;
  const roomId = (await params).id;

  const supabase = await createSupabaseServerClient();

  // 룸 정보 가져오기
  const { data: room, error: roomError } = await supabase
    .from("rooms")
    .select("post_id")
    .eq("id", roomId)
    .single();

  if (roomError || !room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }

  // 포스트 + 호스트 정보 가져오기
  const { data: post, error: postError } = await supabase
    .from("posts")
    .select("*, host:profiles(id, nickname, profile_image)")
    .eq("id", room.post_id)
    .single();

  if (postError || !post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  // 참여자 조회
  const { data: participants, error: participantsError } = await supabase
    .from("participants")
    .select("user_id, role, joined_at, profile:user_id(id, nickname, profile_image)")
    .eq("room_id", roomId);

  if (participantsError) {
    console.error("Participants fetch failed:", participantsError);
  }

  return NextResponse.json({
    post,
    participants: participants ?? [],
  });
}