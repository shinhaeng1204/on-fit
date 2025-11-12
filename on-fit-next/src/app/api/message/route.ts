import {cookies} from "next/headers";
import {createRouteHandlerClient} from "@supabase/auth-helpers-nextjs";
import {NextResponse} from "next/server";
import {createClient} from "@supabase/supabase-js";
import {sbAdmin} from "@/lib/supabase-admin";

export async function POST(req: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

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

  const {error, data} = await sbAdmin
    .from("messages")
    .insert({
      room_id: roomId,
      sender_id: user.id,
      content,
      created_at : new Date().toISOString(),
    })
    .select("*, user_id")
    .single()

  if(error) return NextResponse.json({error: error.message}, {status: 500})

  return NextResponse.json({message: data}, {status: 201})
}