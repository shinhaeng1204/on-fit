// app/api/chat/participants/route.ts
import { NextResponse } from "next/server";
import {
  createSupabaseServerClient,
  requireUserOr401,
} from "@/lib/route-helpers";

export async function GET(req: Request) {
  const supabase = await createSupabaseServerClient();

  const { ok: hasUser, user, response } = await requireUserOr401(supabase);
  if (!hasUser || !user) return response;

  const { searchParams } = new URL(req.url);
  const roomId = searchParams.get("roomId");

  if (!roomId) {
    return NextResponse.json(
      { ok: false, error: "roomId가 필요합니다." },
      { status: 400 }
    );
  }

  // 1) participants: 이 방에 참여한 유저들
  const { data: participants, error: participantError } = await supabase
    .from("participants")
    .select("user_id, role")
    .eq("room_id", roomId)
    .neq("user_id", user.id);

  if (participantError) {
    console.error("participants error:", participantError);
    return NextResponse.json(
      {
        ok: false,
        error: "참여자 목록을 가져올 수 없습니다.",
        detail: participantError.message,
      },
      { status: 500 }
    );
  }

  if (!participants || participants.length === 0) {
    return NextResponse.json({ ok: true, items: [] }, { status: 200 });
  }

  // 2) profiles: 참여자들의 프로필
  const userIds = [...new Set(participants.map((p) => p.user_id))];

  const { data: profiles, error: profileError } = await supabase
    .from("profiles")
    .select("id, nickname, profile_image")
    .in("id", userIds);

  if (profileError) {
    console.error("profiles error:", profileError);
    return NextResponse.json(
      {
        ok: false,
        error: "프로필 정보를 가져올 수 없습니다.",
        detail: profileError.message,
      },
      { status: 500 }
    );
  }

  const { data: reviews } = await supabase
    .from("reviews")
    .select("target_user_id")
    .eq("room_id", roomId)
    .eq("reviewer_id", user.id);

  console.log(reviews)

  const completed = reviews?.map((r) => r.target_user_id) ?? [];

  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));

  const items = participants.map((p) => {
    const profile = profileMap.get(p.user_id);

    return {
      userId: p.user_id,
      role: p.role,
      nickname: profile?.nickname ?? "알 수 없는 사용자",
      profileImage: profile?.profile_image ?? null,
    };
  });

  return NextResponse.json({ ok: true, items, completed }, { status: 200 });
}
