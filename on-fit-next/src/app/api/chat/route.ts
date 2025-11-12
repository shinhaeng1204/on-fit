import {NextResponse} from "next/server";
import {sbAdmin} from "@/lib/supabase-admin";

export async function POST(req: Request) {
  try {
    const {postId} = await req.json()

    if(!postId) {
      return NextResponse.json({error: "Missing postId"} , {status : 400})
    }

    const {data: post, error: postError} = await sbAdmin
    .from("posts")
    .select("title, author_id")
    .eq("id", postId)
    .single()

    if(postError || !post) {
      console.error("Post fetch failed : postError")
      return NextResponse.json({error: "Post not Found"}, {status : 404})
    }

    const { data : room, error: roomError} = await sbAdmin
    .from("rooms")
    .insert({
      name: post.title,
      post_id: postId,
      host_id : post.author_id,
      created_at : new Date().toISOString(),
    })
    .select("id")
    .single()

    if(roomError) {
      console.error("Room creation failed: ", roomError)
      return NextResponse.json({error: roomError.message}, {status: 500})
    }

    const {error: updateError} = await sbAdmin
    .from("posts")
    .update({room_id : room.id})
    .eq("id", postId)

    if(updateError) {
      console.error("Post update failed:", updateError)
      return NextResponse.json({error: updateError}, {status: 500})
    }

    return NextResponse.json({roomId: room.id}, {status: 201})
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}