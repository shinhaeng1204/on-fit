import { createSupabaseServerClient, fail, ok, requireUserOr401 } from "@/lib/route-helpers";

export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient();

  // 로그인 유저 확인
  const { ok: hasUser, user, response } = await requireUserOr401(supabase);
  if (!hasUser) return response;

  const { postId } = await req.json();
  if (!postId) return fail("postId는 필수입니다.");

  try {
    // posts 테이블에서 room 정보 조회 (lock 용도로 단일 조회)
    const { data: post, error: postError } = await supabase
      .from("posts")
      .select("room_id, current_participants, max_participants")
      .eq("id", postId)
      .single();

    if (postError || !post) return fail("Post를 찾을 수 없습니다.", 404);
    const roomId = post.room_id;
    if (!roomId) return fail("해당 포스트에 연결된 방이 없습니다.", 400);

    // 참가자 확인 + 정원 체크
    const { data: existing } = await supabase
      .from("participants")
      .select("room_id, user_id")
      .filter("room_id", "eq", roomId) // UUID vs string 안전하게
      .eq("user_id", user.id)
      .maybeSingle();

    // 이미 참여 중이면 current_participants 증가 없이 바로 return
    if (existing) {
      return ok({ joined: true, message: "이미 참여 중입니다." });
    }



    // 정원 체크
    if (post.current_participants >= post.max_participants) {
      return fail("참여 인원이 최대치에 도달했습니다.", 409);
    }

    // 참가자 등록 (중복 방지 위해 insert 사용)
    const { data: participant, error: insertError } = await supabase
      .from("participants")
      .insert({
        room_id: roomId,
        user_id: user.id,
        role: "member",
        joined_at: new Date().toISOString(),
      })
      .select()
      .single();

    // UNIQUE 충돌 처리
    if (insertError) {
      if (insertError.code === "23505") {
        return ok({ joined: true, message: "이미 참여 중입니다." });
      }
      return fail(insertError.message, 500);
    }

    // posts.current_participants 증가
    const { error: updateError } = await supabase
      .from("posts")
      .update({ current_participants: post.current_participants + 1 })
      .eq("id", postId);

    if (updateError) return fail(updateError.message, 500);

    return ok({
      joined: true,
      participant,
      current_participants: post.current_participants + 1,
    });

  } catch (err: any) {
    console.error("Join API error:", err);
    return fail(err.message || "서버 오류", 500);
  }
}
