'use client'

import {Calendar, MapPin, Send, Users} from "lucide-react";
import {Input} from "@/components/common/Input";
import {Button} from "@/components/common/Button";
import {useParams} from "next/navigation";
import {useEffect, useState} from "react";
import {api} from "@/lib/axios";
import {subscribeMessages} from "@/lib/realtime";
import {toKstDate, toKstTime} from "@/lib/dateFormatter";

interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

interface Profile {
  id: string;
  nickname: string;
  profile_image: string | null;
}

interface RoomInfo {
  title: string;
  location: string;
  created_at: string;
  current_participants: number;
  max_participants: number;
  host : Profile
}

export default function Page () {
  const params = useParams()
  const roomId = params?.id as string
  const [messages, setMessages] = useState<Message[]>([])
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [roomInfo, setRoomInfo] = useState<RoomInfo | null>(null);
  const [content, setContent] = useState<string>("")

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return

    try {
      await api.post("/api/message", {
        roomId,
        content,
      })
      setContent("") // 입력창 초기화
    } catch (err) {
      console.error("메시지 전송 실패:", err)
    }
  }

  useEffect(() => {
    if (!roomId) return;

    const fetchMessages = async () => {
      const res = await api.get(`/api/message?roomId=${roomId}`);
      setMessages(res.data.messages);
      setProfiles(res.data.profiles);
    };
    fetchMessages();

    const fetchRoomInfo = async () => {
      try {
        const res = await api.get(`/api/chat/${roomId}`);
        setRoomInfo(res.data.post);
      } catch (err) {
        console.error("방 정보 불러오기 실패:", err);
      }
    };

    fetchRoomInfo()

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
    <main className="flex flex-col h-screen">
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
      {/* 채팅방 대화 내용 */}
      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 py-4 space-y-4">
          {/* 개설 주최자 소개 */}
          <div className="flex justify-center">
            <span className="bg-secondary/50 text-muted-foreground text-xs px-3 py-1 rounded-full">
              {roomInfo?.host.nickname ?? "알수없음"}님이 채팅방을 개설했습니다.
            </span>
          </div>
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
      {/* 채팅 입력 폼 */}
      <div className="border-t border-border bg-card/80 backdrop-blur-sm container mx-auto px-4 py-4">
        <form onSubmit={sendMessage} className="flex gap-2">
          <Input
            type="text"
            placeholder="메시지를 입력하세요..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <Button type="submit"><Send className="h-4 w-4" /></Button>
        </form>
      </div>
    </main>
  )
}