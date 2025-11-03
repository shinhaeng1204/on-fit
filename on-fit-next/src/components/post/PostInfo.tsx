import {Card, CardContent, CardHeader} from "@/components/common/Card";
import {Calendar, Dumbbell, Flag, MapPin, MessageCircle, Users} from "lucide-react";
import RecruitStatus from "@/components/common/RecruitStatus";
import Badge from "@/components/common/Badge";
import {Button} from "@/components/common/Button";
import React from "react";
import {postType, sportType} from "@/types/post";

export default function PostInfo ({data} : { data: postType }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between mb-4">
          {/* 아이콘, 제목 및 운동 종류 */}
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-primary/10">
              <Dumbbell className="h-6 w-6 text-primary"/>
            </div>
            <div>
              <h1 className="text-2xl font-bold mb-1">{data.title}</h1>
              <p className="text-muted-foreground">{sportType[data.sports]}</p>
            </div>
          </div>
          {/* 모집 상태 */}
          <RecruitStatus type={data.status} text={data.status === 'open' ? '모집중' : '마감'} />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 모임 소개 */}
        <div>
          <h3 className="font-semibold mb-2">모임소개</h3>
          <p className="text-muted-foreground leading-relaxed">
            {data.description}
          </p>
        </div>
        {/* 모임 정보 */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="flex items-start gap-3 p-3 bg-secondary/30 rounded-lg">
            <MapPin className="h-5 w-5 text-primary mt-0.5"/>
            <div>
              <p className="text-sm font-medium mb-1">장소</p>
              <p className="text-sm text-muted-foreground">{data.location}</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-secondary/30 rounded-lg">
            <Calendar className="h-5 w-5 text-primary mt-0.5"/>
            <div>
              <p className="text-sm font-medium mb-1">일정</p>
              <p className="text-sm text-muted-foreground">{data.date}</p>
              <p className="text-sm text-muted-foreground">{data.time}</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-secondary/30 rounded-lg">
            <Users className="h-5 w-5 text-primary mt-0.5"/>
            <div>
              <p className="text-sm font-medium mb-1">인원</p>
              <p className="text-sm text-muted-foreground">{data.currentMember}/{data.totalMember}명</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-secondary/30 rounded-lg">
            <Dumbbell className="h-5 w-5 text-primary mt-0.5"/>
            <div>
              <p className="text-sm font-medium mb-1">실력</p>
              <p className="text-sm text-muted-foreground">
                <Badge type={data.level}/>
              </p>
            </div>
          </div>
        </div>
        {/* 추가 정보 */}
        <div className="space-y-3 pt-4 border-t border-border">
          <div>
            <p className="text-sm font-medium mb-1">준비물</p>
            <p className="text-sm text-muted-foreground">{data.requirements}</p>
          </div>
          <div>
            <p className="text-sm font-medium mb-1">참가비</p>
            <p className="text-sm text-muted-foreground">{data.fee}</p>
          </div>
        </div>
        {/* 참여, 신고 */}
        <div className="flex gap-3 pt-4">
          <Button size="lg" href={'/'} fullWidth="true" leftIcon={<MessageCircle />} className="cursor-pointer">참여하기</Button>
          <Button variant='sport' size="lg" rightIcon={<Flag />} className="cursor-pointer"></Button>
        </div>
      </CardContent>
    </Card>
  )
}