import { createSupabaseServerClient, fail, ok, requireUserOr401 } from "@/lib/route-helpers";

export async function GET() {
    const supabase = await createSupabaseServerClient();

    // 로그인 유저 확인
    const {ok: hasUser, user, response} = await requireUserOr401(supabase);
    if(!hasUser || !user) return response;

    // 내가 참여하고 있는 participatns row들 가져오기
    const {data: myParticipants, error: participantError} = await supabase
    .from("participants")
    .select("room_id, role, joined_at")
    .eq("user_id", user.id);

    if(participantError) {
        console.error("participantsError:", participantError);
        return fail("참여중인 채팅방을 불러오는데 실패했습니다.");
    }

    if(!myParticipants || myParticipants.length === 0) {
        return ok({items: []}); // 참가한 방이 없는 경우

    }

    const roomIds = Array.from(
        new Set(myParticipants.map((p) => p.room_id as string))
    )

    // rooms 정보 가져오기
    const {data: rooms, error: roomsError} = await supabase
    .from("rooms")
    .select("id, name, post_id, created_at")
    .in("id", roomIds);

    if (roomsError) {
    console.error("roomsError:", roomsError);
    return fail("채팅방 정보를 불러오는데 실패했습니다.");
  }

  // posts 정보 가져오기 (제목/종목/태그 등을 쓰고 싶으면 여기)
// posts 정보 가져오기 (제목/종목/태그 등을 쓰고 싶으면 여기)
const postIds = Array.from(
  new Set((rooms ?? []).map((r) => r.post_id).filter(Boolean) as string[])
);

let postsById: Record<string, any> = {};

if (postIds.length > 0) {
  const { data: posts, error: postsError } = await supabase
    .from("posts")
    .select("id, title, sport, location, date_time") // 실제 컬럼 이름으로 수정
    .in("id", postIds);                              // 이 방들에 해당하는 post만

  if (postsError) {
    console.error("postsError:", postsError);
    // 실패해도 리스트 자체는 보여주고 싶으면 여기서 그냥 넘어가면 됨
  } else if (posts) {
    postsById = posts.reduce((acc, post) => {
      acc[post.id] = post;
      return acc;
    }, {} as Record<string, any>);
  }
}

   // 각 방의 마지막 메시지 가져오기
  const { data: messages, error: messagesError } = await supabase
    .from("messages")
    .select("room_id, content, created_at")
    .in("room_id", roomIds)
    .order("created_at", { ascending: false });

  if (messagesError) {
    console.error("messagesError:", messagesError);
    // 실패해도 리스트는 보여주고 lastMessage는 비워둠
  }
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

   // participants에서 방별 인원수, 내 role 계산
  const participantsCountByRoom: Record<string, number> = {};
  const myRoleByRoom: Record<string, string> = {};

  myParticipants.forEach((p) => {
    const rid = p.room_id as string;
    participantsCountByRoom[rid] = (participantsCountByRoom[rid] ?? 0) + 1;
    myRoleByRoom[rid] = p.role;
  });

  // 최종 응답 형태로 가공
  const items = (rooms ?? []).map((room) => {
    const rid = room.id as string;
    const post = room.post_id ? postsById[room.post_id] : null;
    const lastMessage = lastMessageByRoom[rid];

    return {
      roomId: rid,
      // 카드에서 쓸 타이틀: 포스트 제목 우선, 없으면 rooms.name
      title: post?.title ?? room.name,
      // 예시로 sport를 태그처럼 쓰고 싶으면
      sport: post?.sport ?? null,
      tag: post?.sport ?? null,
      // 인원 수
      currentParticipants: participantsCountByRoom[rid] ?? 1,
      // 마지막 메시지 정보
      lastMessage: lastMessage?.content ?? "",
      lastMessageTime: lastMessage?.created_at ?? room.created_at,
      // 내가 이 방에서 가진 역할 (host / member 등)
      role: myRoleByRoom[rid] ?? "member",
    };
  });

  // joined_at 기준으로 정렬하고 싶으면 여기서 정렬해도 됨

  return ok({ items });
}