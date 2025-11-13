import { createSupabaseServerClient } from "@/lib/route-helpers";
import { NextResponse } from "next/server";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_: Request, context: Ctx) {
  const params = await context.params;
  const roomId = params.id;

  const supabase = await createSupabaseServerClient();

  const { data: room, error: roomError } = await supabase
    .from("rooms")
    .select("post_id")
    .eq("id", roomId)
    .single();

  if (roomError || !room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }

  const postId = room.post_id;

  const { data: post, error: postError } = await supabase
    .from("posts")
    .select("*, host:profiles(id, nickname, profile_image)") // host 정보 조인
    .eq("id", postId)
    .single();

  if (postError || !post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  return NextResponse.json({ post });
}
