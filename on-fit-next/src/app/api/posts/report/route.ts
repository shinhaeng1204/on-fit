import {cookies} from "next/headers";
import {createRouteHandlerClient} from "@supabase/auth-helpers-nextjs";
import {NextResponse} from "next/server";

export async function POST(req : Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const body = await req.json()

    const {postId, targetUserId, reason, details } = body

    const {
      data: {user},
      error: userError,
    } = await supabase.auth.getUser()

    if(userError || !user) {
      return NextResponse.json({error: "Unauthorized"}, {status : 401})
    }

    if(!postId || !reason) {
      return NextResponse.json({error: "필수 값이 존재하지 않습니다."}, {status: 40})
    }

    const {error} = await supabase.from("reports").insert({
      reporter_id : user.id,
      post_id : postId,
      target_user_id : targetUserId,
      reason,
      details,
    })

    if(error) {
      console.error("Report insert error:", error)
      return NextResponse.json({error: error.message}, {status: 500})
    }

    return NextResponse.json({message: "신고가 접수되었습니다."}, {status: 201})
  } catch(e) {
    console.error("서버에러 : ", e)
    return NextResponse.json({error: "Internal Server Error"}, {status: 500})
  }
}