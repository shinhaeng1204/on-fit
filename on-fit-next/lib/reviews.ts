import { createSupabaseServerClient } from "@/lib/route-helpers";
import type { Review } from "@/types/review";

export async function getMyReviews(targetUserId: string): Promise<Review[]> {
  const supabase = await createSupabaseServerClient();

  // 1) 내가 받은 리뷰 가져오기
  const { data: reviews, error: rErr } = await supabase
    .from("reviews")
    .select("id, reviewer_id, target_user_id, room_id, content, created_at")
    .eq("target_user_id", targetUserId)
    .order("created_at", { ascending: false });

  if (rErr) {
    console.error("[getMyReviews] reviews error:", rErr);
    return [];
  }
  if (!reviews || reviews.length === 0) return [];

  // reviewer_id들
  const reviewerIds = Array.from(new Set(reviews.map(r => r.reviewer_id)));
  // room_id들
  const roomIds = Array.from(new Set(reviews.map(r => r.room_id)));

  // 2) 리뷰어 프로필 한번에 가져오기
  const { data: profiles, error: pErr } = await supabase
    .from("profiles")
    .select("id, nickname, profile_image")
    .in("id", reviewerIds);

  if (pErr) {
    console.error("[getMyReviews] profiles error:", pErr);
  }

  // 3) rooms 한번에 가져오기
  const { data: rooms, error: roomErr } = await supabase
    .from("rooms")
    .select("id, name")
    .in("id", roomIds);

  if (roomErr) {
    console.error("[getMyReviews] rooms error:", roomErr);
  }

  const profileMap = new Map(profiles?.map(p => [p.id, p]) ?? []);
  const roomMap = new Map(rooms?.map(r => [r.id, r]) ?? []);

  return (reviews as Review[]).map(r => ({
    ...r,
    reviewer: profileMap.get(r.reviewer_id),
    room: roomMap.get(r.room_id),
  }));
}
