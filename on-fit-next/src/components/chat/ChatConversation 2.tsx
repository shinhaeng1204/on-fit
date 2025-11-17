'use client'

import {useEffect, useState} from "react";
import {api} from "@/lib/axios";
import {subscribeMessages} from "@/lib/realtime";
import {Message, Profile} from "@/types/chat";
import {toKstTime} from "@/lib/dateFormatter";
import {useParams} from "next/navigation";

export default function ChatConversation () {
  const params = useParams()
  const roomId = params?.id as string
  const [messages, setMessages] = useState<Message[]>([])
  const [profiles, setProfiles] = useState<Profile[]>([])

  useEffect(() => {
    if (!roomId) return;

    const fetchMessages = async () => {
      const res = await api.get(`/api/message?roomId=${roomId}`);
      setMessages(res.data.messages);
      setProfiles(res.data.profiles);
    };
    fetchMessages();

    const unsubscribe = subscribeMessages(roomId, (msg) => {
      setMessages((prev) => [...prev, msg]);
    });
    return unsubscribe;
  }, [roomId]);

  const messagesWithUsername = messages.map(msg => {
    const user = profiles.find(p => p.id === msg.sender_id);
    return {
      ...msg,
      nickname: user?.nickname ?? "알 수 없음",
      profile_image: user?.profile_image ?? null
    };
  });

  return (
    <>
      {/* 채팅방 대화 내용 */}
      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 py-4 space-y-4">
          {/* 대화 */}
          {messagesWithUsername.map((msg) => (
            <div key={msg.id} className="flex gap-3">
              {/* TODO: 프로필 이미지 추가 */}
              <div className="flex flex-col items-start max-w-[70%]">
                <p className="text-xs text-muted-foreground mb-1">{msg.nickname}</p>
                <div className="px-4 py-2 rounded-2xl bg-card border border-border">
                  {msg.content}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {toKstTime(msg.created_at)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}