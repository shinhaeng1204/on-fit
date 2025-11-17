import { NextResponse } from "next/server";
import { requireUserOr401, ok, fail, toISOFromKST, createSupabaseServerClient } from "@/lib/route-helpers";

export const runtime = "nodejs";

// GET: 공개 목록( RLS에서 to public using (true) 설정했으므로 익명도 조회 가능)
export async function GET() {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return fail(error.message, 500);
  return ok({ items: data });
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

  const required = ["title", "sport", "location", "date", "time"];
  const missing = required.filter((k) => !b?.[k]);
  if (missing.length) return fail(`필수값 누락: ${missing.join(", ")}`, 400);

  const dateISO = toISOFromKST(b.date, b.time);
  if (!dateISO) return fail("잘못된 날짜/시간 형식", 400);

  const payload = {
    sport: String(b.sport),
    title: String(b.title),
    location: String(b.location),
    date_time: dateISO,
    level: b.level ?? "브론즈",
    status: b.status ?? "모집중",
    current_participants: Number(b.currentParticipants ?? 1),
    max_participants: Math.max(1, Number(b.maxParticipants ?? 1)),
    author_id: user.id, // RLS가 체크
    description: b.description ?? "",
    requirement: b.requirement ?? "",
    fee: b.fee ?? "",
  };

  const { data, error } = await supabase.from("posts").insert(payload).select().single();
  if (error) return fail(error.message, 400);
  return ok({ item: data }, { status: 201 });
}
