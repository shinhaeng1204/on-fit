// app/api/reviews/route.ts
import { NextResponse } from "next/server";
import {
  createSupabaseServerClient,
  requireUserOr401,
  ok,
  fail,
} from "@/lib/route-helpers";

export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient();

  // 로그인 유저 확인
  const { ok: hasUser, user, response } = await requireUserOr401(supabase);
  if (!hasUser || !user) return response;

  const { targetUserId, roomId, content } = await req.json();

  if (!targetUserId || !roomId || !content || !content.trim()) {
    return NextResponse.json(
      { ok: false, error: "INVALID_PAYLOAD" },
      { status: 400 }
    );
  }

  const { error } = await supabase.from("reviews").insert({
    reviewer_id: user.id,
    target_user_id: targetUserId,
    room_id: roomId,
    content,
  });

  if (error) {
    console.error("review insert error:", error);
    return fail("리뷰를 저장하는 데 실패했습니다.");
  }

  return ok({ message: "리뷰가 등록되었습니다." });
}
