'use client'

import { Card, CardContent, CardHeader } from "@/components/common/Card";
import Image from "next/image";
import StatusBadge from "@/components/main/StatusBadge";
import { useRouter } from "next/navigation";
import { api } from "@/lib/axios";
import { Button } from "@/components/common/Button"; // ✅ 추가

type ChatRoomCardProps = {
  title: string;
  member: number;
  time: string;
  chatting: string;
  tag: string;
  roomId: string;
  unreadCount: number;
  canReview: boolean;
  onLeave: (roomId: string) => void;
};

export default function ChatRoomCard({
  roomId,
  title,
  member,
  time,
  chatting,
  tag,
  unreadCount,
  canReview,
  onLeave
}: ChatRoomCardProps) {
  const router = useRouter();

  // 카드 전체 클릭 → 채팅방 입장 + 읽음 처리
  const handleChatRoomCard = () => {
    api
      .post("/api/chat/read", { roomId })
      .catch((err) => {
        console.error("read 처리 실패", err);
      });

    router.push(`/chat/${roomId}`);
  };

  // 리뷰하러 가기 버튼 클릭 → 리뷰 페이지 이동
  const handleReviewClick = (e: React.MouseEvent) => {
    e.stopPropagation(); 
    router.push(`/review/${roomId}`);
  };

    const handleLeave = async (e: React.MouseEvent) => {
        e.stopPropagation();
    const ok = confirm("정말 채팅방을 나가시겠습니까?")
    if(!ok) return
    try {
      await api.delete(`/api/chat/${roomId}/leave`);
      onLeave?.(roomId)
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <Card
      className="m-4 md:my-10 md:mx-40 relative cursor-pointer"
      onClick={handleChatRoomCard}
    >
      <CardHeader className="flex-row gap-3 items-start">
        {/* 이미지 + 뱃지 오버레이 컨테이너 */}
        <div className="relative">
          <Image
            src="/onfit.png"
            width={60}
            height={60}
            alt="profile"
            className="rounded-full"
          />

          {/* unreadCount 뱃지 */}
          {unreadCount > 0 && (
            <span
              className="
                absolute -top-1 -right-1 
                inline-flex items-center justify-center 
                rounded-full bg-red-500 
                text-white text-[10px] font-bold 
                w-5 h-5
              "
            >
              {unreadCount}
            </span>
          )}
        </div>

        <div className=" gap-2">
          <div className="flex flex-row gap-2 ">
            <h3 className="font-bold text-ellipsis md:w-full whitespace-nowrap overflow-hidden">
              {title}
            </h3>
            <StatusBadge variant="outline">{member}</StatusBadge>

            <div className="ml-auto flex items-center gap-2">
              <span className="text-xs absolute right-5">{time}</span>
              
            </div>
          </div>

          <h3 className="text-sm font-semibold mb-2 mt-2">{chatting}</h3>
          <StatusBadge variant="outline">{tag}</StatusBadge>
          
        </div>
      </CardHeader>
      <CardContent>
        {canReview && (
            <div className="mt-3 flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleLeave}
                className="w-full"
              >
                나가기
              </Button>
              <Button
                variant="default"
                size="sm"
                className="w-full"
                onClick={handleReviewClick}
              >
                리뷰하러가기
              </Button>
            </div>
          )}
      </CardContent>
    </Card>
  );
}
