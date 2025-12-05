'use client'

import {Button} from "@/components/common/Button";
import {Flag, MessageCircle} from "lucide-react";
import React, {useState} from "react";
import {api} from "@/lib/axios";
import ReportModal from "@/app/(view)/(main)/post/components/ReportModal";
import {redirect, useRouter} from "next/navigation";
import { createSupabaseServerClient } from "@/lib/route-helpers";
import type { User } from '@supabase/supabase-js'

interface PostInfoClientType {
  postId : string,
  roomId : string,
  title : string,
  targetUserId : string
  user?: User | null
}

export default function PostInfoClient ({postId, roomId, title, targetUserId, user} : PostInfoClientType) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  const handleJoinChat = async () => {
    if(!user){
      redirect(`/auth?next=/post/${postId}`);
    }
    try {
      if (!roomId) {
        // 룸이 없으면 생성
        const res = await api.post("/api/chat", { postId: postId });
        const { roomId } = res.data;
        router.push(`/chat/${roomId}`);
        return;
      }

      await api.post("/api/chat/join", { postId: postId });

      router.push(`/chat/${roomId}`);
    } catch (err: any) {
      const status = err?.response?.status;
      const message =
        err?.response?.data?.error ??
        err?.response?.data?.message ??
        err.message;
      console.error("채팅방 참여 실패", message);

      // 정원 초과 처리(409)
      if (status === 409) {
        alert("모집 인원이 이미 가득 찼습니다.");
        return;
      }

      // 기타 에러 처리
      alert("채팅방 참여 중 오류가 발생했습니다.");
    }
  };

  return (
    <>
      <div className="flex gap-3 pt-4">
        <Button
          size="lg"
          onClick={handleJoinChat}
          fullWidth
          leftIcon={<MessageCircle/>}
          className="cursor-pointer"
        >
          참여하기
        </Button>

        <Button
          variant="sport"
          size="lg"
          className="cursor-pointer"
          onClick={() => setIsOpen(true)}
        >
          <Flag/>
        </Button>
      </div>

      <ReportModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        postId={String(postId)}
        postTitle={title ?? ""} targetUserId={targetUserId ?? ""} />
    </>
  )
}