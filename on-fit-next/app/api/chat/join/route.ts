import {
  createSupabaseServerClient,
  fail,
  ok,
  requireUserOr401,
} from "@/lib/route-helpers";

export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient();

  // 로그인 확인
  const { ok: hasUser, user, response } = await requireUserOr401(supabase);
  if (!hasUser) return response;

  const { postId } = await req.json();
  if (!postId) return fail("postId는 필수입니다.");

  try {
    // posts 정보 조회
    const { data: post, error: postError } = await supabase
      .from("posts")
      .select(
        "room_id, current_participants, max_participants, author_id, title"
      )
      .eq("id", postId)
      .single();

    if (postError || !post) return fail("Post를 찾을 수 없습니다.", 404);

    const roomId = post.room_id;
    if (!roomId) return fail("해당 포스트에 연결된 방이 없습니다.", 400);

    // 🔥 2) 이미 참여했는지 체크
    const { data: existing } = await supabase
      .from("participants")
      .select("room_id, user_id")
      .eq("room_id", roomId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (existing) {
      return ok({
        joined: true,
        already: true,
        message: "이미 참여 중입니다.",
      });
    }

    // --- 정원 체크 ---
    const isAlreadyFull = post.current_participants >= post.max_participants;
    const willBeFull = post.current_participants + 1 === post.max_participants;

    if (isAlreadyFull) {
      return fail("참여 인원이 최대치에 도달했습니다.", 409);
    }

    // --- participants 등록 ---
    const { data: participant, error: insertError } = await supabase
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
      .maybeSingle();

    if (insertError) return fail(insertError.message, 500);

    // --- 모집 상태 업데이트 ---
    const newStatus = willBeFull ? "마감" : "모집중";

    await supabase
      .from("posts")
      .update({
        current_participants: post.current_participants + 1,
        status: newStatus,
      })
      .eq("id", postId);

    // --- 정원 꽉 찼을 때 알림 ---
    if (willBeFull) {
      await supabase.from("notifications").insert({
        user_id: post.author_id,
        actor_id: user.id,
        type: "room_full",
        message: `모임 "${post.title}"의 모집 인원이 모두 찼어요.`,
        post_id: postId,
        room_id: roomId,
        read: false,
      });
    }

    return ok({
      joined: true,
      participant,
      current_participants: post.current_participants + 1,
      status: newStatus,
    });
  } catch (err: any) {
    console.error("Join API error:", err);
    return fail(err.message || "서버 오류", 500);
  }
}
