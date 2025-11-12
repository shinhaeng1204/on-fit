'use client'

import {Calendar, MapPin, Send, Users} from "lucide-react";
import {Input} from "@/components/common/Input";
import {Button} from "@/components/common/Button";
import {useParams} from "next/navigation";
import {useEffect, useState} from "react";
import {api} from "@/lib/axios";
import {subscribeMessages} from "@/lib/realtime";
import {toKstTime} from "@/lib/dateFormatter";

interface Message {
  id: string
  user_id: string
  user_name: string
  content: string
  created_at: string
}

export default function Page () {
  const params = useParams()
  const roomId = params?.id as string
  const [messages, setMessages] = useState<Message[]>([])
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
    };
    fetchMessages();

    const unsubscribe = subscribeMessages(roomId, (msg) => {
      console.log("Realtime msg:", msg);
      setMessages((prev) => [...prev, msg]);
    });
    return unsubscribe;
  }, [roomId]);

  return (
    <main className="flex flex-col h-screen">
      {/* 채팅방 정보 */}
      <div className="bg-card/50 border-b border-border">
        <div className="container mx-auto px-4 py-3 flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <p>강남구 역삼동 체육관</p>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <p>11월 5일 19:00</p>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="h-4 w-4" />
            <p>3/6명</p>
          </div>
        </div>
      </div>
      {/* 채팅방 대화 내용 */}
      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 py-4 space-y-4">
          {/* 개설 주최자 소개 */}
          <div className="flex justify-center">
            <span className="bg-secondary/50 text-muted-foreground text-xs px-3 py-1 rounded-full">
              운동왕님이 채팅방을 개설했습니다.
            </span>
          </div>
          {/* 대화 */}
          {messages.map((msg) => (
            <div key={msg.id} className="flex gap-3">
              {/* TODO: 프로필 이미지 추가 */}
              <div className="flex flex-col items-start max-w-[70%]">
                <p className="text-xs text-muted-foreground mb-1">{msg.username}</p>
                <div className="px-4 py-2 rounded-2xl bg-card border border-border">
                  {msg.content}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {toKstTime(msg.createdAt)}
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