'use client'

import { motion } from "framer-motion";
import {X} from "lucide-react";
import {JSX, useEffect, useState} from "react";
import {api} from "@/lib/axios";
import {Profile} from "@/types/profilemodal";
import ProfileImage from "@/components/common/ProfileImage";
import Badge from "@/components/common/Badge";
import {Button} from "@/components/common/Button";
import ProfileModal from "@/components/profile/ProfileModal";
import {useQuery} from "@tanstack/react-query";

type ChatParticipantsProps = {
  roomId: string;
  onClose: () => void;
};

export default function ChatParticipants({ roomId, onClose }: ChatParticipantsProps) {
  const [open, setOpen] = useState<boolean>(false)
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);

  const { data: participants = [], isLoading, isError } = useQuery({
    queryKey: ["chatParticipants", roomId],
    queryFn: async () => {
      const res = await api.get(`/api/chat/rooms/participants?roomId=${roomId}`);
      return res.data.participants;
    },
    enabled: !!roomId,
  });

  return (
    <>
      <motion.div
        initial={{ x: 300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 300, opacity: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 25 }}
        className="fixed right-0 top-0 h-full md:w-110 w-[100%]  bg-card z-50 p-6 overflow-y-auto"
      >
        <div className="mb-4 flex justify-between">
          <h4 className="text-lg font-semibold">참여자 보기</h4>
          <Button variant="ghost" size="sm" onClick={onClose} className="cursor-pointer"><X /></Button>
        </div>

        <div className="flex flex-col gap-4">
          {participants.map((p: { profiles: Profile; role: string }): JSX.Element => (
            <button type="button"
                    key={p.profiles.id}
                    className="flex justify-start items-center gap-3 p-3 rounded-lg bg-card border border-border hover:bg-accent/50 transition-colors cursor-pointer"
                    onClick={() => {
                      setSelectedProfile(p.profiles);
                      setOpen(true)
                    }}>
                <ProfileImage src={p.profiles?.profile_image ?? ""} profileName={p.profiles?.nickname}/>
                <div className="flex-1">
                  <div className="font-medium">{p.profiles?.nickname ?? "알 수 없음"}</div>
                  <div className="text-xs text-muted-foreground">
                    {p.role === "host" ? "방장" : "참여자"}
                  </div>
                </div>
               
            </button>
          ))}
        </div>
        <ProfileModal
          open={open}
          onClose={() => setOpen(false)}
          profileId={selectedProfile?.id as string}
        />
      </motion.div>
    </>
  );
}