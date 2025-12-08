'use client'
import { Calendar, DumbbellIcon, MapPin, Users } from "lucide-react";
import { Card, CardContent, CardHeader } from "../common/Card";
import Badge from "../common/Badge";
import { Button } from "../common/Button";
import Link from "next/link";
import RecruitStatus from "@/components/common/RecruitStatus";
import React, { useState } from "react";
import { postType } from "@/types/post";
import { Profile } from "@/types/profilemodal";
import ProfileModal from "../profile/ProfileModal";

export default function FitCard({
  id,
  title,
  status,
  sport,
  location,
  date,
  time,
  current_participants,
  max_participants,
  level,
  profile,
}: postType) {
  // 주최자 닉네임만 사용
  const hostName =
    (profile as any)?.nickname ??
    "운동 메이트"; // Profile 타입에 nickname 있으면 any 대신 정확한 타입으로 바꿔도 됨

  const [openProfileModal, setOpenProfileModal] = useState(false);

  const [modalProfile, setModalProfile] = useState<Profile | null>(
    (profile as Profile) ?? null,
  );

  const handleHostClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    // 카드 전체가 Link라서, 이동 막아줘야 함
    e.preventDefault();
    e.stopPropagation();
    setOpenProfileModal(true);
  };


  return (
    <>
    <Link href={`/post/${id}`}>
      <Card className="group hover:border-primary/50 transition-all duration-300 hover:shadow-glow-primary cursor-pointer">
        <CardHeader className="relative flex-row gap-2">
          <div className="flex items-center rounded-lg bg-primary/10 p-2">
            <DumbbellIcon className="h-5 text-primary" />
          </div>
          <div className="flex flex-col">
            <RecruitStatus
              type={status}
              text={status}
              className="absolute right-5"
            />
            <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
              {title}
            </h3>
            <span className="text-sm text-muted-foreground">{sport}</span>
          </div>
        </CardHeader>

        <CardContent className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <MapPin className="text-muted-foreground w-4 h-4" />
            <span className="text-muted-foreground text-sm font-semibold">
              {location}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="text-muted-foreground w-4 h-4" />
            <span className="text-muted-foreground text-sm font-semibold">
              {date} {time}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Users className="text-muted-foreground w-4 h-4" />
            <span className="text-muted-foreground text-sm font-semibold">
              {current_participants}/{max_participants}명
            </span>
          </div>

          <div className="py-[0.1px] w-full bg-muted-foreground/40 mt-2 backdrop-blur-3xl" />

          <div className="flex mt-2 justify-between items-center">
            <Badge type={level} className="max-h-6" />
            <div className="flex items-center gap-2">
              <h3 className="text-sm text-muted-foreground">
              주최:
            </h3>
            <button
                type="button"
                onClick={handleHostClick}
                className="text-sm text-muted-foreground hover:text-primary "
              >
              {hostName}
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
     {/*<ProfileModal
        open={openProfileModal}
        onClose={() => setOpenProfileModal(false)}
        profileId={modalProfile?.id}
      />*/}
      </>
  );
}