'use client'
import { Calendar, DumbbellIcon, MapPin, Users } from "lucide-react";
import { Card, CardContent, CardHeader } from "../common/Card";
import Badge from "../common/Badge";
import Link from "next/link";
import RecruitStatus from "@/components/common/RecruitStatus";
import React, { useState } from "react";
import { postType } from "@/types/post";
import ProfileModal from "../profile/ProfileModal";
import {toKstDate, toKstTime} from "@/lib/dateFormatter";
import {DefaultSportIcon, sportIcons} from "@/lib/sportIcons";

export default function FitCard({
  id,
  title,
  status,
  sport,
  location,
  date_time,
  author_id,
  current_participants,
  max_participants,
  level,
  profiles,
}: postType) {
  // 주최자 닉네임만 사용
  const hostName =
    (profiles as any)?.nickname ??
    "운동 메이트"; // Profile 타입에 nickname 있으면 any 대신 정확한 타입으로 바꿔도 됨

  const [openProfileModal, setOpenProfileModal] = useState(false);

  const handleHostClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    // 카드 전체가 Link라서, 이동 막아줘야 함
    e.preventDefault();
    e.stopPropagation();
    setOpenProfileModal(true);
  };

  const SportIcon = sportIcons[sport] ?? DefaultSportIcon

  return (
    <>
    <Link href={`/post/${id}`}>
      <Card className="group hover:border-primary/50 transition-all duration-300 hover:shadow-glow-primary cursor-pointer">
        <CardHeader className="flex flex-row gap-2 items-center">
        {/* 아이콘 */}
        <div className="flex items-center rounded-lg bg-primary/10 p-2">
          <SportIcon className="h-5 text-primary" />
        </div>

        {/* 오른쪽 전체 영역 */}
        <div className="flex-1 min-w-0">
          {/* 제목 + 상태 뱃지를 한 줄로 */}
          <div className="flex items-start gap-2">
            {/* 제목 + 종목 텍스트 영역 */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg group-hover:text-primary transition-colors truncate">
                {title}
              </h3>
              <span className="text-sm text-muted-foreground">{sport}</span>
            </div>
            <RecruitStatus
              type={status}
              text={status}
              className="shrink-0"
            />
          </div>
        </div>
      </CardHeader>


        <CardContent className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <MapPin className="text-muted-foreground w-4 h-4"/>
            <span className="text-muted-foreground text-sm font-semibold">
              {location}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="text-muted-foreground w-4 h-4"/>
            <span className="text-muted-foreground text-sm font-semibold">
              {toKstDate(date_time)} {toKstTime(date_time)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Users className="text-muted-foreground w-4 h-4"/>
            <span className="text-muted-foreground text-sm font-semibold">
              {current_participants}/{max_participants}명
            </span>
          </div>

         

          <div className="flex mt-2 gap-3 justify-between items-center border-t border-muted-foreground/40 pt-4">
            {/* 왼쪽 배지 */}
            <Badge type={level} className="max-h-6 shrink-0"/>

            {/* 오른쪽 영역 */}
            <button
              type="button"
              onClick={handleHostClick}
              className="text-sm text-muted-foreground hover:text-primary cursor-pointer
               flex-1 min-w-0 text-right"
            >
              <span className="block truncate">
                주최: {hostName}
              </span>
            </button>
          </div>
        </CardContent>
      </Card>
    </Link>
      <ProfileModal
        open={openProfileModal}
        onClose={() => setOpenProfileModal(false)}
        profileId={author_id ?? ''}
      />
    </>
  );
}