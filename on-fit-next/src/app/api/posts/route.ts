import { NextResponse } from "next/server";
import { requireUserOr401, ok, fail, toISOFromKST, createSupabaseServerClient } from "@/lib/route-helpers";

export const runtime = "nodejs";

// GET: 공개 목록( RLS에서 to public using (true) 설정했으므로 익명도 조회 가능)
export async function GET(req: Request) {
  const supabase = await createSupabaseServerClient()

  const { searchParams } = new URL(req.url)
  const page = Number(searchParams.get("page") ?? 0)
  const limit = 10
  const from = page * limit
  const to = from + limit - 1

  const { data, error } = await supabase
    .from("posts")
    .select(`
      *,
      profiles:author_id (
        id,
        nickname,
        profile_image
      )
    `)
    .eq("is_deleted", false)
    .order("created_at", { ascending: false })
    .range(from, to)

  if (error) return Response.json({ error: error.message }, { status: 500 })

  return Response.json({
    items: data,
    nextPage: data.length < limit ? null : page + 1,
  })
}

// POST: 로그인 필요 + RLS(with check author_id = auth.uid()) 준수
export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient();
  const auth = await requireUserOr401(supabase);
  if (!auth.ok) return auth.response;
  const user = auth.user;

  let b: any;
  try {
    b = await req.json();
  } catch {
    return fail("INVALID_JSON_BODY", 400);
  }

  // 필수값에 lat/lng/regionLabel 추가
  const required = ["title", "sport", "location", "date", "time", "latitude", "longitude", "regionLabel"];
  const missing = required.filter((k) => b[k] === undefined || b[k] === null || b[k] === "");
  if (missing.length) return fail(`필수값 누락: ${missing.join(", ")}`, 400);

  const dateISO = toISOFromKST(b.date, b.time);
  if (!dateISO) return fail("잘못된 날짜/시간 형식", 400);

  const payload = {
    sport: String(b.sport),
    title: String(b.title),

    // 기존
    location: String(b.location),
    date_time: dateISO,
    level: b.level ?? "브론즈",
    status: b.status ?? "모집중",
    current_participants: Number(b.currentParticipants ?? 1),
    max_participants: Math.max(1, Number(b.maxParticipants ?? 1)),
    author_id: user.id,
    description: b.description ?? "",
    requirement: b.requirement ?? "",
    fee: b.fee ?? "",

    // 새로 추가된 좌표 기반 위치 정보
    latitude: Number(b.latitude),
    longitude: Number(b.longitude),
    region_label: String(b.regionLabel),
  };

  const { data, error } = await supabase
    .from("posts")
    .insert(payload)
    .select()
    .single();

  if (error) return fail(error.message, 400);

  // 기존처럼 팔로워 알림 유지
  await notifyFollowers(supabase, user.id, data);

  return ok({ item: data }, { status: 201 });
}


//알림 생성 함수
async function notifyFollowers(supabase:any, author_id:string, data:any){
  //author 프로필 읽기
  const {data:authorProfile} = await supabase
    .from("profiles")
    .select("followers, nickname")
    .eq("id", author_id)
    .single()

  if(!authorProfile) return

  const followerIds: string[] = authorProfile.followers ?? []
  if(followerIds.length === 0) return

  const authorNickname = authorProfile.nickname ?? "알 수 없음"

  const alerts = followerIds.map((targetUserId)=>({
    user_id: targetUserId,
    actor_id: author_id,
    actor_nickname:authorNickname,
    type: "post",
    message: `${authorNickname}님이 새로운 ${data.sport} 게시글을 등록했습니다.`,
    post_title: data.title,
    post_id: data.id,
    read:false,
  }))

  await supabase.from("notifications").insert(alerts)
}
