import { Card, CardContent, CardHeader } from "@/components/common/Card";
import { Calendar, Dumbbell, MapPin, Users } from "lucide-react";
import RecruitStatus from "@/components/common/RecruitStatus";
import Badge from "@/components/common/Badge";
import React from "react";
import { toKstDate, toKstTime } from "@/lib/dateFormatter";
import {createSupabaseServerClient} from "@/lib/route-helpers";
import {postType} from "@/types/post";
import PostInfoClient from "@/app/(main)/post/components/PostInfoClient";
import {DefaultSportIcon, sportIcons} from "@/lib/sportIcons";

export default async function PostInfo({id} : {id:string}) {
  const supabase = await createSupabaseServerClient();
  const {
      data: { user },
    } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("posts")
    .select("*, profile:profiles(id, nickname)")
    .eq("id", id)
    .single();

  if (error) return <div>오류: {error.message}</div>;

  const SportIcon = sportIcons[data?.sport] ?? DefaultSportIcon

  return (
    <>
      <Card className="mb-6">
        <CardHeader>
          {/* 제목/설명/아이콘 */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-primary/10">
                <SportIcon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold mb-1">{data?.title ?? ""}</h1>
                <p className="text-muted-foreground">{data?.sport ?? ""}</p>
              </div>
            </div>

            {/* 모집 상태 */}
            {data?.status && (
              <RecruitStatus type={data.status} text={data.status} />
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* 모임 소개 */}
          <div>
            <h3 className="font-semibold mb-2">모임소개</h3>
            <p className="text-muted-foreground leading-relaxed">
              {data?.description ?? ""}
            </p>
          </div>

          {/* 모임 정보 */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-3 bg-secondary/30 rounded-lg">
              <MapPin className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm font-medium mb-1">장소</p>
                <p className="text-sm text-muted-foreground">{data?.location ?? ""}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-secondary/30 rounded-lg">
              <Calendar className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm font-medium mb-1">일정</p>
                {data?.date_time ? (
                  <p className="text-sm text-muted-foreground">
                    {toKstDate(data.date_time)} {toKstTime(data.date_time)}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground"></p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-secondary/30 rounded-lg">
              <Users className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm font-medium mb-1">인원</p>
                <p className="text-sm text-muted-foreground">
                  {data?.current_participants ?? 0}/{data?.max_participants ?? 0}명
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-secondary/30 rounded-lg">
              <Dumbbell className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm font-medium mb-1">실력</p>
                <p className="text-sm text-muted-foreground">
                  <Badge type={data?.level ?? "브론즈"} />
                </p>
              </div>
            </div>
          </div>

          {/* 추가 정보 */}
          <div className="space-y-3 pt-4 border-t border-border">
            {data?.requirement && (
              <div>
                <p className="text-sm font-medium mb-1">준비물</p>
                <p className="text-sm text-muted-foreground">{data.requirement}</p>
              </div>
            )}
            {data?.fee && (
              <div>
                <p className="text-sm font-medium mb-1">참가비</p>
                <p className="text-sm text-muted-foreground">{data.fee}</p>
              </div>
            )}
          </div>

          {/* 참여, 신고 */}
          <PostInfoClient postId={id} roomId={data.room_id} title={data.title} targetUserId={data.profile?.id} user={user}/>
        </CardContent>
      </Card>
    </>
  );
}
