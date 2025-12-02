import {cookies} from "next/headers";
import {NextResponse} from "next/server";
import {createClient} from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/route-helpers";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

export async function POST(req: Request) {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get("sb-access-token")?.value

  if (!accessToken) {
    return NextResponse.json({ error: "Unauthorized: token missing" }, { status: 401 })
  }

  const authClient = createClient(url, anonKey)
  const { data: userData, error: userError } = await authClient.auth.getUser(accessToken)

  if (userError || !userData?.user) {
    console.error("Invalid user token:", userError)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const user = userData.user
  const {roomId, content} = await req.json()

  if(!roomId || !content) {
    return NextResponse.json({error: "roomId와 content는 필수입니다."}, {status: 400})
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: { Authorization: `Bearer ${accessToken}` }
      }
    }
  );

  const {error, data} = await supabase
    .from("messages")
    .insert({
      room_id: roomId,
      sender_id: user.id,
      content,
      created_at : new Date().toISOString(),
    })
    .select("*")

  if(error) return NextResponse.json({error: error.message}, {status: 500})

  if(data && data.length >0){
    // 1) 방의 참여자 목록 가져오기
    const {data:participants, error:participantsError} = await supabase
      .from("participants")
      .select("user_id")
      .eq("room_id", roomId)

    if(participantsError){
      console.error("participants error", participantsError)
    } else{
      // 2)sender 제외
      const receivers = participants
        .map((p)=>p.user_id)
        .filter((id)=>id !==user.id)
      // 3) 각 유저에게 알림 생성 (중복 알림 방지)
      for (const receiverId of receivers) {

        // 🔥 3-1 기존에 읽지 않은 알림이 있는지 확인
        const { data: existing, error: existsError } = await supabase
          .from("notifications")
          .select("id")
          .eq("user_id", receiverId)
          .eq("room_id", roomId)
          .eq("type", "chat")
          .eq("read", false)
          .limit(1);

        // 에러 무시하고(알림 막지는 않음) 기존 알림이 이미 있다면 새로 만들지 않음
        if (!existsError && existing && existing.length > 0) {
          console.log(`🔔 기존 알림이 있어 새 알림을 생성하지 않음: user=${receiverId} room=${roomId}`);
          continue;
        }

        // 🔥 3-2 새로운 알림 생성
        await supabase.from("notifications").insert({
          user_id: receiverId,
          actor_id: user.id,
          type: "chat",
          room_id: roomId,
          message: "새로운 메시지가 도착했습니다.",
          read: false,
        });
      }
    }
  }

  return NextResponse.json({message: data}, {status: 201})
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const roomId = searchParams.get("roomId");

  if (!roomId) {
    return NextResponse.json({ error: "Missing roomId" }, { status: 400 });
  }
  
  const supabase = await createSupabaseServerClient()

  try {
    const { data: messages, error: messagesError } = await supabase
      .from("messages")
      .select("*")
      .eq("room_id", roomId)
      .order("created_at", { ascending: true });

    if (messagesError) throw messagesError;

    const userIds = Array.from(new Set(messages.map(m => m.sender_id)));

    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, nickname, profile_image")
      .in("id", userIds);

    if (profilesError) throw profilesError;

    return NextResponse.json({ messages, profiles }, { status: 200 });
  } catch (e: any) {
    console.error("GET /messages error:", e);
    return NextResponse.json({ error: e.message ?? "Internal Server Error" }, { status: 500 });
  }
}