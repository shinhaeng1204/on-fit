import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/route-helpers";

export async function POST(req: Request) {
  const { target } = await req.json();

  if (!target) {
    return NextResponse.json({ error: "target required" }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  // 🔥 1) RPC 호출 (배열 기반 follow)
  const { error: rpcError } = await supabase.rpc("follow_user", {
    p_target: target,
  });

  if (rpcError) {
    console.error(rpcError);
    return NextResponse.json({ error: "rpc failed" }, { status: 500 });
  }

  // 🔥 2) 알림 넣기
  const { data: actingUser } = await supabase
    .from("profiles")
    .select("nickname")
    .eq("id", user.id)
    .single();

  const actorNickname = actingUser?.nickname ?? "알 수 없음";

  await supabase.from("notifications").insert({
    user_id: target,
    actor_id: user.id,
    actor_nickname: actorNickname,
    type: "follow",
    message: `${actorNickname}님이 당신을 팔로우했습니다!`,
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const target = searchParams.get("target");

  if (!target) {
    return NextResponse.json({ error: "target required" }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  // 🔥 1) RPC 통해 unfollow
  const { error: rpcError } = await supabase.rpc("unfollow_user", {
    p_target: target,
  });

  if (rpcError) {
    console.error(rpcError);
    return NextResponse.json({ error: "rpc failed" }, { status: 500 });
  }

  // ❌ 언팔로우는 알림 없음 (원래 로직 유지)
  return NextResponse.json({ ok: true });
}
