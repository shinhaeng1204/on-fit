import { createSupabaseServerClient, requireUserOr401, fail, ok } from "@/lib/route-helpers";

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const {id: roomId} = await params;
  const supabase = await createSupabaseServerClient();

  // 로그인 검사
  const { ok: hasUser, user, response } = await requireUserOr401(supabase);
  if (!hasUser) return response;

  console.log(roomId)

  // 참가 여부 확인
  const { data: participant, error: participantErr } = await supabase
    .from("participants")
    .select("room_id, user_id")
    .eq("room_id", roomId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (participantErr) return fail("참여자 조회 실패", 500);
  if (!participant) return fail("이미 방에 참여 중이 아닙니다.", 400);

  // 참가자 삭제
  const { error: deleteErr } = await supabase
    .from("participants")
    .delete()
    .eq("room_id", roomId)
    .eq("user_id", user.id);

  if (deleteErr) return fail(deleteErr.message, 500);

  // posts.current_participants 감소
  const { data: room } = await supabase
    .from("rooms")
    .select("post_id")
    .eq("id", roomId)
    .single();

  if (room?.post_id) {
    const { data: post } = await supabase
      .from("posts")
      .select("current_participants, max_participants")
      .eq("id", room.post_id)
      .single();

    if (post) {
      const newCount = Math.max(0, post.current_participants - 1);
      const newStatus = newCount >= post.max_participants ? "마감" : "모집중";

      await supabase
        .from("posts")
        .update({
          current_participants: newCount,
          status: newStatus,
        })
        .eq("id", room.post_id);
    }
  }

  return ok({ left: true });
}
