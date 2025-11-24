'use client'

import { motion } from "framer-motion";
import {X} from "lucide-react";
import {useEffect, useState} from "react";
import {api} from "@/lib/axios";
import {Profile} from "@/types/profilemodal";
import ProfileImage from "@/components/common/ProfileImage";
import Badge from "@/components/common/Badge";
import {Button} from "@/components/common/Button";

type ChatParticipantsProps = {
  roomId: string;
  onClose: () => void;
};

interface Participants {
  role: string
  profiles: Profile
}

export default function ChatParticipants({ roomId, onClose }: ChatParticipantsProps) {
  const [participants, setParticipants] = useState<Participants[]>([])

  useEffect(() => {
    const fetchParticipants = async () => {
      const res = await api.get(`/api/chat/rooms/participants?roomId=${roomId}`);
      setParticipants(res.data.participants);
    };
    fetchParticipants();
  }, [roomId]);

  return (
    <>
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-black/30 z-40"
      />

      <motion.div
        initial={{ x: 300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 300, opacity: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 25 }}
        className="fixed right-0 top-0 h-full w-110 bg-card z-50 p-6 overflow-y-auto"
      >
        <div className="mb-4 flex justify-between">
          <h4 className="text-lg font-semibold">참여자 보기</h4>
          <Button variant="ghost" size="sm" onClick={onClose} className="cursor-pointer"><X /></Button>
        </div>

        <div className="flex flex-col gap-4">
          {participants.map(p => (
            <div key={p.profiles.id} className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border hover:bg-accent/50 transition-colors cursor-pointer">
              <ProfileImage src={p.profiles?.profile_image} profileName={p.profiles?.nickname}/>
              <div className="flex-1">
                <div className="font-medium">{p.profiles?.nickname ?? "알 수 없음"}</div>
                <div className="text-xs text-muted-foreground">
                  {p.role === "host" ? "방장" : "참여자"}
                </div>
              </div>
              {/* TODO: 추후 profiles에 추가되면 실제 데이터 필요 */}
              <Badge type="브론즈" />
            </div>
          ))}
        </div>
      </motion.div>
    </>
  );
}