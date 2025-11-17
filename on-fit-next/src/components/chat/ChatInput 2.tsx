'use client'

import {Input} from "@/components/common/Input";
import {Button} from "@/components/common/Button";
import {Send} from "lucide-react";
import {useState} from "react";
import {api} from "@/lib/axios";
import {useParams} from "next/navigation";

export default function ChatInput() {
  const params = useParams()
  const roomId = params?.id as string
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

  return (
    <div className="border-t border-border bg-card/80 backdrop-blur-sm px-4 py-4">
      <form onSubmit={sendMessage} className="flex gap-2">
        <Input
          type="text"
          placeholder="메시지를 입력하세요..."
          value={content}
          className="w-full"
          onChange={(e) => setContent(e.target.value)}
        />
        <Button type="submit"><Send className="h-4 w-4"/></Button>
      </form>
    </div>
  )
}