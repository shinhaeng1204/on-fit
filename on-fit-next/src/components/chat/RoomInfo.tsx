'use client'

import {Calendar, MapPin, Users, EllipsisVertical, UserMinus} from "lucide-react";
import { toKstDate, toKstTime } from "@/lib/dateFormatter";
import { useEffect, useState } from "react";
import { RoomInfoData } from "@/types/chat";
import { api } from "@/lib/axios";
import { useParams } from "next/navigation";
import Header from "@/components/common/Header";
import { Button } from "@/components/common/Button";

export default function RoomInfo() {
  const params = useParams();
  const roomId = params?.id as string;
  const [roomInfo, setRoomInfo] = useState<RoomInfoData | null>(null);
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!roomId) return;

    const fetchRoomInfo = async () => {
      try {
        const res = await api.get(`/api/chat/${roomId}`);
        setRoomInfo(res.data.post);
      } catch (err) {
        console.error("방 정보 불러오기 실패:", err);
      }
    };

    fetchRoomInfo();
  }, [roomId]);

  const MenuList = (
    <div className="z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2">
      <div className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-50 focus:bg-accent focus:text-accent-foreground">
        참여자보기
      </div>
      <div className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-50 focus:bg-accent focus:text-accent-foreground">
        나가기
      </div>
    </div>
  )

  return (
    <>
      <Header
        variant="back"
        title="뒤로"
        containerClassName="bg-card/80 backdrop-blur-sm border-b border-border"
        right={
          <>
            <Button onClick={() => setOpen((v) => !v)} variant="ghost" className="cursor-pointer">
              <EllipsisVertical className="w-4 h-4" />
            </Button>

            {open && (
              <div
                className="absolute flex flex-col right-10 top-15 z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md">
                <Button
                  variant="ghost"
                  size="inherit"
                  leftIcon={(<Users />)}
                  className="block flex justify-start px-2 py-1 cursor-pointer">
                  참여자 보기
                </Button>

                <Button
                  variant="ghost"
                  size="inherit"
                  leftIcon={(<UserMinus/>)}
                  className="block flex justify-start text-destructive px-2 py-1 mt-1 cursor-pointer">
                   나가기
                </Button>
              </div>
            )}
          </>
        }
      />

      {/* 채팅방 정보 */}
      <div className="bg-card/50 border-b border-border">
        <div className="container mx-auto px-4 py-3 flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4"/>
            <p>{roomInfo?.location}</p>
          </div>

          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4"/>
            {roomInfo?.created_at && (
              <p>
                {toKstDate(roomInfo.created_at)}{" "}
                {toKstTime(roomInfo.created_at)}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="h-4 w-4" />
            <p>
              {roomInfo?.current_participants}/{roomInfo?.max_participants}명
            </p>
          </div>
        </div>
      </div>

      {/* 개설 주최자 소개 */}
      <div className="flex justify-center mt-4">
        <span className="bg-secondary/50 text-muted-foreground text-xs px-3 py-1 rounded-full">
          {roomInfo?.host?.nickname ?? "알수없음"}님이 채팅방을 개설했습니다.
        </span>
      </div>
    </>
  );
}
