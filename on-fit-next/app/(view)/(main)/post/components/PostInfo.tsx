'use client'

import { Card, CardContent, CardHeader } from "@/components/common/Card";
import { Calendar, Dumbbell, MapPin, Users } from "lucide-react";
import RecruitStatus from "@/components/common/RecruitStatus";
import Badge from "@/components/common/Badge";
import React from "react";
import { toKstDate, toKstTime } from "@/lib/dateFormatter";
import PostInfoClient from "@/app/(view)/(main)/post/components/PostInfoClient";
import {DefaultSportIcon, sportIcons} from "@/lib/sportIcons";
import {useQuery} from "@tanstack/react-query";
import {api} from "@/lib/axios";
import PostInfoSkeleton from "@/app/(view)/(main)/post/components/PostInfoSkelton";

export default function PostInfo({id} : {id:string}) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["post", id],
    queryFn: async () => {
      const res = await api.get(`/api/posts/${id}`);
      return res.data.item;
    },
  });

  if (isLoading) return (
    <PostInfoSkeleton />
  );
  if (error) return <div>오류 발생</div>;
  if (!data) return <div>데이터 없음</div>;

  const SportIcon = sportIcons[data?.sport] ?? DefaultSportIcon

  return (
    <>
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start justify-between mb-4 w-full">
            {/* 왼쪽: 아이콘 + 제목 영역 */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="p-3 rounded-lg bg-primary/10 flex-shrink-0">
                <SportIcon className="h-6 w-6 text-primary"/>
              </div>

              {/* 제목/스포츠 */}
              <div className="min-w-0">
                <h1 className="text-2xl font-bold mb-1 truncate">
                  {data?.title ?? ""}
                </h1>
                <p className="text-muted-foreground whitespace-pre-wrap break-words">
                  {data?.sport ?? ""}
                </p>
              </div>
            </div>

            {/* 오른쪽: 모집 상태 */}
            {data?.status && (
              <div className="flex-shrink-0 ml-3">
                <RecruitStatus type={data.status} text={data.status}/>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* 모임 소개 */}
          <div>
            <h3 className="font-semibold mb-2">모임소개</h3>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-line break-words">
              {data?.description ?? ""}
            </p>
          </div>

          {/* 모임 정보 */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-3 bg-secondary/30 rounded-lg">
              <MapPin className="h-5 w-5 text-primary mt-0.5"/>
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
                  <Badge type={data?.level ?? "활동가"} />
                </p>
              </div>
            </div>
          </div>

          {/* 추가 정보 */}
          <div className="space-y-3 pt-4 border-t border-border">
            {data?.requirement && (
              <div>
                <p className="text-sm font-medium mb-1">준비물</p>
                <p className="text-sm text-muted-foreground whitespace-pre-line break-words">{data.requirement}</p>
              </div>
            )}
            {data?.fee && (
              <div>
                <p className="text-sm font-medium mb-1">참가비</p>
                <p className="text-sm text-muted-foreground whitespace-pre-line break-words">{data.fee}</p>
              </div>
            )}
          </div>

          {/* 참여, 신고 */}
          <PostInfoClient postId={id} roomId={data.room_id} title={data.title} hostId={data.author_id}/>
        </CardContent>
      </Card>
    </>
  );
}
