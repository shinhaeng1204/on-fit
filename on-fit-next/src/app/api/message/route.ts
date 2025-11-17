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