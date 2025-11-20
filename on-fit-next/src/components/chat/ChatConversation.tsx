'use client'

import { useEffect, useState } from "react";
import { api } from "@/lib/axios";
import { subscribeMessages } from "@/lib/realtime";
import { Message, Profile } from "@/types/chat";
import { toKstTime } from "@/lib/dateFormatter";
import { useParams } from "next/navigation";
import ProfileImage from "@/components/common/ProfileImage";

export default function ChatConversation() {
  const params = useParams();
  const roomId = params?.id as string;
  const [messages, setMessages] = useState<Message[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [userId, setUserId] = useState<string>('')

  useEffect(() => {
    if (!roomId) return;

    const fetchMessages = async () => {
      const res = await api.get(`/api/message?roomId=${roomId}`);
      setMessages(res.data.messages);
      setProfiles(res.data.profiles);
    };

    fetchMessages();

    const fetchUser = async () => {
      const res = await api.get(`/api/auth/me`);
      setUserId(res.data.user.id)
    }

    fetchUser()

    const unsubscribe = subscribeMessages(roomId, (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    // 여기가 핵심: cleanup은 동기 함수여야 함
    return () => {
      if (unsubscribe) {
        // unsubscribe가 Promise를 리턴하더라도
        // cleanup 함수는 아무것도 리턴하지 않도록 한다.
        void unsubscribe();
      }
    };
  }, [roomId]);

  const messagesWithUsername = messages.map((msg) => {
    const profile = profiles.find((p) => p.id === msg.sender_id);
    return {
      ...msg,
      nickname: profile?.nickname ?? "알 수 없음",
      profile_image: profile?.profile_image ?? null,
    };
  });

  return (
    <>
      {/* 채팅방 대화 내용 */}
      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 py-4 space-y-4">
          {/* 대화 */}
          {messagesWithUsername.map((msg) => {
            const isMine = msg.sender_id === userId

            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isMine ? "flex-row-reverse" : "flex-row"}`}
              >
                {!isMine && (
                  <ProfileImage src={msg.profile_image ?? ""} profileName={msg.nickname} />
                )}

                <div
                  className={`flex flex-col max-w-[70%] ${
                    isMine ? "items-end text-right" : "items-start"
                  }`}
                >
                  {!isMine && (
                    <p className="text-xs text-muted-foreground mb-1">{msg.nickname}</p>
                  )}

                  <div
                    className={`px-4 py-2 rounded-2xl border border-border ${
                      isMine ? "bg-primary text-primary-foreground" : "bg-card"
                    }`}
                  >
                    {msg.content}
                  </div>

                  <p className="text-xs text-muted-foreground mt-1">
                    {toKstTime(msg.created_at)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
