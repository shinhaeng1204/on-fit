import { createSupabaseServerClient, fail, ok, requireUserOr401 } from "@/lib/route-helpers";

export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient();

  // 로그인 유저 확인
  const { ok: hasUser, user, response } = await requireUserOr401(supabase);
  if (!hasUser) return response;

  const { postId } = await req.json();
  if (!postId) return fail("postId는 필수입니다.");

  try {
    // posts 테이블에서 room_id, current_participants, max_participants 조회
    const { data: post, error: postError } = await supabase
      .from("posts")
      .select("room_id, current_participants, max_participants")
      .eq("id", postId)
      .single();

    if (postError || !post) return fail("Post를 찾을 수 없습니다.", 404);

    const roomId = post.room_id;

    if (!roomId) return fail("해당 포스트에 연결된 방이 없습니다.", 400);

    // 이미 최대 인원에 도달했는지 체크
    if (post.current_participants >= post.max_participants) {
      return fail("참여 인원이 최대치에 도달했습니다.", 400);
    }

    // participants 테이블에서 이미 참여 여부 확인
    const { data: existing } = await supabase
      .from("participants")
      .select("id")
      .eq("room_id", roomId)
      .eq("user_id", user.id)
      .single();

    if (existing) return ok({ joined: true, message: "이미 참여 중입니다." });

    // participants 테이블에 insert (upsert 사용으로 PK 중복 방지)
    const { data: participant, error: participantError } = await supabase
      .from("participants")
      .upsert(
        {
          room_id: roomId,
          user_id: user.id,
          role: "member",
          joined_at: new Date().toISOString(),
        },
        { onConflict: "room_id,user_id" }
      )
      .select()
      .single();

    if (participantError) return fail(participantError.message, 500);

    // posts 테이블 current_participants 증가
    const { error: updateError } = await supabase
      .from("posts")
      .update({ current_participants: post.current_participants + 1 })
      .eq("id", postId);

    if (updateError) return fail(updateError.message, 500);

    return ok({ joined: true, participant, current_participants: post.current_participants + 1 });

  } catch (err: any) {
    console.error("Join API error:", err);
    return fail(err.message || "서버 오류", 500);
  }
}