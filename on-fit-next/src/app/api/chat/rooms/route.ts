import {
  createSupabaseServerClient,
  fail,
  ok,
  requireUserOr401,
} from "@/lib/route-helpers";

export async function GET() {
  const supabase = await createSupabaseServerClient();

  //  로그인 유저 확인
  const { ok: hasUser, user, response } = await requireUserOr401(supabase);
  if (!hasUser || !user) return response;

  //  내가 참여하고 있는 participants row들 가져오기
  const { data: myParticipants, error: participantError } = await supabase
    .from("participants")
    .select("room_id, role, joined_at")
    .eq("user_id", user.id);

  if (participantError) {
    console.error("participantsError:", participantError);
    return fail("참여중인 채팅방을 불러오는데 실패했습니다.");
  }

  if (!myParticipants || myParticipants.length === 0) {
    return ok({ items: [] }); // 참가한 방이 없는 경우
  }

  const roomIds = Array.from(
    new Set(myParticipants.map((p) => p.room_id as string)),
  );

  //  rooms 정보 가져오기
  const { data: rooms, error: roomsError } = await supabase
    .from("rooms")
    .select("id, name, post_id, created_at")
    .in("id", roomIds);

  if (roomsError) {
    console.error("roomsError:", roomsError);
    return fail("채팅방 정보를 불러오는데 실패했습니다.");
  }

  //  posts 정보 가져오기 (제목/종목/현재 인원 등)
  const postIds = Array.from(
    new Set((rooms ?? []).map((r) => r.post_id).filter(Boolean) as string[]),
  );

  let postsById: Record<string, any> = {};

  if (postIds.length > 0) {
    const { data: posts, error: postsError } = await supabase
      .from("posts")
      // 🔹 current_participants 여기서 가져온다
      .select("id, title, sport, location, date_time, current_participants")
      .in("id", postIds);

    if (postsError) {
      console.error("postsError:", postsError);
      // 실패해도 리스트 자체는 보여주고 싶으면 그냥 진행
    } else if (posts) {
      postsById = posts.reduce((acc, post) => {
        acc[post.id] = post;
        return acc;
      }, {} as Record<string, any>);
    }
  }

  //  각 방의 메시지 + unread 계산에 필요한 필드 가져오기
  const { data: messages, error: messagesError } = await supabase
    .from("messages")
    .select("room_id, content, created_at, sender_id, read_by")
    .in("room_id", roomIds)
    .order("created_at", { ascending: false });

  if (messagesError) {
    console.error("messagesError:", messagesError);
    // 실패해도 리스트는 보여주고 lastMessage/unread는 비워둘 수 있음
  }

  //  방별 마지막 메시지
  const lastMessageByRoom: Record<
    string,
    { content: string | null; created_at: string | null }
  > = {};

  (messages ?? []).forEach((m) => {
    const rid = m.room_id as string;
    // created_at 기준 전체 내림차순이라, 처음 들어오는 게 최신
    if (!lastMessageByRoom[rid]) {
      lastMessageByRoom[rid] = {
        content: m.content,
        created_at: m.created_at,
      };
    }
  });

  //  방별 안 읽은 메시지 수 계산
  const unreadCountByRoom: Record<string, number> = {};

  (messages ?? []).forEach((m) => {
    const rid = m.room_id as string;
    const senderId = m.sender_id as string | null;
    const readBy = (m.read_by ?? []) as string[];

    // 내가 보낸 메시지는 unread 대상 아님
    if (senderId === user.id) return;

    // read_by에 내 user.id가 없으면 "안 읽음"
    if (!readBy.includes(user.id)) {
      unreadCountByRoom[rid] = (unreadCountByRoom[rid] ?? 0) + 1;
    }
  });

  //  participants에서 "내 역할"만 계산
  const myRoleByRoom: Record<string, string> = {};

  myParticipants.forEach((p) => {
    const rid = p.room_id as string;
    myRoleByRoom[rid] = p.role;
  });

  const now = new Date();

  //  최종 응답 형태로 가공
  const items = (rooms ?? []).map((room) => {
    const rid = room.id as string;
    const post = room.post_id ? postsById[room.post_id] : null;
    const lastMessage = lastMessageByRoom[rid];

    const recruitEndAt: string | null = post?.date_time ?? null;

    const canReview = recruitEndAt !== null ? new Date(recruitEndAt) <= now : false

    return {
      roomId: rid,
      // 카드에서 쓸 타이틀: 포스트 제목 우선, 없으면 rooms.name
      title: post?.title ?? room.name,
      // 예시로 sport를 태그처럼 쓰고 싶으면
      sport: post?.sport ?? null,
      tag: post?.sport ?? null,
      // 🔹 인원 수: posts.current_participants만 사용
      currentParticipants: post?.current_participants ?? 1,
      // 마지막 메시지 정보
      lastMessage: lastMessage?.content ?? "",
      lastMessageTime: lastMessage?.created_at ?? room.created_at,
      // 내가 이 방에서 가진 역할 (host / member 등)
      role: myRoleByRoom[rid] ?? "member",
      // 안 읽은 메시지 수
      unreadCount: unreadCountByRoom[rid] ?? 0,

      recruitEndAt,

      canReview
    };
  });

  // joined_at 기준 정렬 필요하면 여기서 items.sort(...) 가능

  return ok({ items });
}
