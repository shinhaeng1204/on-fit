import {cookies} from "next/headers";
import {NextResponse} from "next/server";
import {createClient} from "@supabase/supabase-js";
import {sbAdmin} from "@/lib/supabase-admin";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

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

  return NextResponse.json({message: data}, {status: 201})
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const roomId = searchParams.get("roomId");

  if (!roomId) {
    return NextResponse.json({ error: "Missing roomId" }, { status: 400 });
  }

  try {
    const { data: messages, error: messagesError } = await sbAdmin
      .from("messages")
      .select("*")
      .eq("room_id", roomId)
      .order("created_at", { ascending: true });

    if (messagesError) {
      console.error("Supabase messages error:", messagesError);
      return NextResponse.json({ error: messagesError.message }, { status: 500 });
    }

    const userIds = Array.from(new Set(messages.map(m => m.sender_id)));

    const { data: profiles, error: profilesError } = await sbAdmin
      .from("profiles")
      .select("id, nickname, profile_image")
      .in("id", userIds);

    if (profilesError) {
      console.error("Supabase profiles error:", profilesError);
      return NextResponse.json({ error: profilesError.message }, { status: 500 });
    }

    const messagesWithUser = messages.map(msg => {
      const user = profiles?.find(p => p.id === msg.sender_id);
      return {
        id: msg.id,
        roomId: msg.room_id,
        userId: msg.sender_id,
        username: user?.username ?? "알 수 없음",
        avatarUrl: user?.avatar_url ?? null,
        content: msg.content,
        createdAt: msg.created_at,
      };
    });

    return NextResponse.json({ messages: messagesWithUser }, { status: 200 });
  } catch (e) {
    console.error("Server error:", e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}