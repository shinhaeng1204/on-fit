import {createSupabaseServerClient, fail, ok, requireUserOr401} from "@/lib/route-helpers";

export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient();
  const { ok: hasUser, user, response } = await requireUserOr401(supabase);
  if (!hasUser) return response;

  const { roomId } = await req.json();
  if (!roomId) return fail("roomId는 필수입니다.");

  const { data: existing } = await supabase
    .from("participants")
    .select("id")
    .eq("room_id", roomId)
    .eq("user_id", user.id)
    .single();

  console.log(roomId, user.id)

  console.log(existing)

  return ok({ joined: !!existing });
}