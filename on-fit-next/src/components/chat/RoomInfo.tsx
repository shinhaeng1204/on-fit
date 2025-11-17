'use client'

import {Calendar, MapPin, Users, EllipsisVertical} from "lucide-react";
import {toKstDate, toKstTime} from "@/lib/dateFormatter";
import {useEffect, useState} from "react";
import {RoomInfoData} from '@/types/chat.ts'
import {api} from "@/lib/axios";
import {useParams} from "next/navigation";
import Header from "@/components/common/Header";
import {Button} from "@/components/common/Button";

export default function RoomInfo () {
  const params = useParams()
  const roomId = params?.id as string
  const [roomInfo, setRoomInfo] = useState<RoomInfoData | null>(null);

  useEffect(() => {
    const fetchRoomInfo = async () => {
      try {
        const res = await api.get(`/api/chat/${roomId}`);
        setRoomInfo(res.data.post);
      } catch (err) {
        console.error("방 정보 불러오기 실패:", err);
      }
    };

    fetchRoomInfo()
  }, [roomId])

  return (
    <>
      <Header
        variant="back"
        title="뒤로"
        containerClassName="bg-card/80 backdrop-blur-sm border-b border-border"
        right={<>
          <Button variant="ghost" className="cursor-pointer"><EllipsisVertical className="w-4 h-4" /></Button>
        </>}
      ></Header>
      {/* 채팅방 정보 */}
      <div className="bg-card/50 border-b border-border">
        <div className="container mx-auto px-4 py-3 flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <p>{roomInfo?.location}</p>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <p>{toKstDate(roomInfo?.created_at)} {toKstTime(roomInfo?.created_at)}</p>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="h-4 w-4" />
            <p>{roomInfo?.current_participants}/{roomInfo?.max_participants}명</p>
          </div>
        </div>
      </div>
      {/* 개설 주최자 소개 */}
      <div className="flex justify-center mt-4">
        <span className="bg-secondary/50 text-muted-foreground text-xs px-3 py-1 rounded-full">
          {roomInfo?.host.nickname ?? "알수없음"}님이 채팅방을 개설했습니다.
        </span>
      </div>
    </>
  )
}