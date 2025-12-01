import { createSupabaseServerClient } from "@/lib/route-helpers";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const roomId = searchParams.get("roomId");

  if (!roomId) {
    return NextResponse.json({ error: "Missing roomId" }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("participants")
    .select(`
      user_id,
      role,
      joined_at,
      profiles (
        id,
        nickname,
        profile_image,
        following,
        followers
      )
    `)
    .eq("room_id", roomId);

  if (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ participants: data });
}
