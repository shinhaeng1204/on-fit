import { requireUserOr401, ok, fail, createSupabaseServerClient } from "@/lib/route-helpers";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient();
  const auth = await requireUserOr401(supabase);
  if (!auth.ok) return auth.response;
  const user = auth.user;

  let body: any;
  try {
    body = await req.json();
  } catch {
    return fail("INVALID_JSON_BODY", 400);
  }

  const { nickname, location, sport_preference } = body;

  const { error } = await supabase.from("profiles").upsert({
    id: user.id,
    email: user.email ?? null,
    nickname,
    location,
    sport_preference,
    updated_at: new Date(),
  });

  if (error) return fail(error.message, 500);
  return ok({});
}
