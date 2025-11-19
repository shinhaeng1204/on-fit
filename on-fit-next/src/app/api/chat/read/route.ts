import {
  createSupabaseServerClient,
  fail,
  ok,
  requireUserOr401,
} from "@/lib/route-helpers";

export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient();

  const { ok: hasUser, user, response } = await requireUserOr401(supabase);
  if (!hasUser || !user) return response;

  const { roomId } = await req.json();
  if (!roomId) return fail("ROOM_ID_MISSING");

  // 이 방의 메시지들 중 내가 아직 안 읽은 것들만 가져오기
  const { data: messages, error } = await supabase
    .from("messages")
    .select("id, read_by, sender_id")
    .eq("room_id", roomId);

  if (error) {
    console.error("messagesError (mark read):", error);
    return fail("메시지를 읽음 처리하는데 실패했습니다.");
  }

  if (!messages || messages.length === 0) {
    return ok({ updated: 0 });
  }

  const targets = messages.filter((m) => {
    const readBy = (m.read_by ?? []) as string[];
    const senderId = m.sender_id as string | null;
    // 내가 보낸 건 패스 + 아직 내가 안 들어있는 메시지만
    return senderId !== user.id && !readBy.includes(user.id);
  });

  // 하나씩 read_by에 내 userId 추가
  await Promise.all(
    targets.map((m) => {
      const readBy = (m.read_by ?? []) as string[];
      return supabase
        .from("messages")
        .update({ read_by: [...readBy, user.id] })
        .eq("id", m.id);
    }),
  );

  return ok({ updated: targets.length });
}
