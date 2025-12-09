'use client'

import {useEffect, useRef, useState} from "react";
import { api } from "@/lib/axios";
import { subscribeMessages } from "@/lib/realtime";
import { Message, Profile } from "@/types/chat";
import { toKstTime } from "@/lib/dateFormatter";
import ProfileImage from "@/components/common/ProfileImage";
import {Button} from "@/components/common/Button";
import {useQuery} from "@tanstack/react-query";

interface ChatConversationProps {
  roomId : string
}

export default function ChatConversation({roomId} : ChatConversationProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [userId, setUserId] = useState<string>("");

  // React Query로 메시지 및 프로필 데이터 가져오기
  const { data, refetch } = useQuery({
    queryKey: ["chat", roomId],
    queryFn: async () => {
      const res = await api.get(`/api/message?roomId=${roomId}`);
      return res.data;
    },
    enabled: !!roomId,
  });

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const res = await api.get(`/api/auth/me`);
      setUserId(res.data.user.id);
    },
  });

  const messages = data?.messages ?? [];
  const profiles = data?.profiles ?? [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // 실시간 구독
  useEffect(() => {
    if (!roomId) return;

    const unsubscribe = subscribeMessages(roomId, (msg: Message) => {
      refetch(); // 새 메시지가 오면 React Query refetch
    });

    return () => {
      if (unsubscribe) void unsubscribe();
    };
  }, [roomId, refetch]);

  // 메시지 변경될 때마다 스크롤
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const messagesWithUsername = messages.map((msg: Message) => {
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
                  <ProfileImage src={msg.profile_image ?? ""} profileName={msg.nickname}/>
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
          <div ref={messagesEndRef}/>
        </div>
      </div>
    </>
  );
}
