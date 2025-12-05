import { createSupabaseServerClient } from "@/lib/route-helpers";
import { getBadgesByJoinedCount } from "@/app/(view)/(main)/mypage/badges";

export async function getMyPageData() {
  const supabase = await createSupabaseServerClient();

  // 1) 로그인 유저
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  // 2) 프로필 가져오기
 const { data: profile } = await supabase
  .from("profiles")
  .select(`
    id,
    nickname,
    profile_image,
    followers,
    following,
    location,
    sport_preference
  `)
  .eq("id", user.id)
  .single();


  if (!profile) throw new Error("Profile not found");

  // 3) 참여 횟수
  const { count: joinedCount } = await supabase
    .from("participants")
    .select("room_id", { count: "exact", head: true })
    .eq("user_id", user.id);

  const safeJoinedCount = joinedCount ?? 0;

  // 4) 참여 횟수에 따른 뱃지 계산
  const badges = getBadgesByJoinedCount(safeJoinedCount);

  return {
    profile,
    joinedCount: safeJoinedCount,
    badges,
  };
}
