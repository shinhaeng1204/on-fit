'use client'

import { Card, CardContent, CardHeader } from "@/components/common/Card";
import StatusBadge from "@/components/common/StatusBadge";
import { useRouter } from "next/navigation";
import { api } from "@/lib/axios";
import { Button } from "@/components/common/Button";

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
  onRead?: (roomId: string) => void;
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
  onLeave,
  onRead,
}: ChatRoomCardProps) {
  const router = useRouter();

  // 카드 클릭 → 채팅 입장 + 읽음 처리
  const handleChatRoomCard = () => {

    onRead?.(roomId);
    
    api.post("/api/chat/read", { roomId }).catch((err) => {
      console.error("read 처리 실패", err);
    });

    router.push(`/chat/${roomId}`);
  };

  // 리뷰하러 가기
  const handleReviewClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/review/${roomId}`);
  };

  // 나가기
  const handleLeave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const ok = confirm("정말 채팅방을 나가시겠습니까?");
    if (!ok) return;

    try {
      await api.delete(`/api/chat/${roomId}/leave`);
      onLeave?.(roomId);
    } catch (e) {
      console.error(e);
    }
  };

  const firstTitle = title?.slice(0, 1) ?? "?";

  return (
    <Card
      className="w-[90vw] md:w-[60vw] lg:w-[60vw] xl:w-[60vw] relative cursor-pointer"
      onClick={handleChatRoomCard}
    >
      <CardHeader className="flex-row gap-3 items-start">
        {/* 프로필 원형 + unread 뱃지 */}
        <div className="relative">
          <div className="w-14 h-14 bg-gradient-brand flex items-center justify-center shadow-md rounded-full">
            <span className="text-white font-bold text-lg">{firstTitle}</span>
          </div>

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

        {/* 오른쪽 컨텐츠 영역 */}
        <div className="flex flex-col gap-2 w-full min-w-0">
          
          {/* 제목 + 인원수 + 시간 absolute 고정 영역 */}
          <div className="relative w-full pr-16">
            <div className="flex items-center gap-2 min-w-0">
              <h3 className="font-bold truncate min-w-0">
                {title}
              </h3>

              <StatusBadge
                variant="outline"
                className="shrink-0"
              >
                {member}
              </StatusBadge>
            </div>

            {/* 시간 absolute 오른쪽 고정  */}
            <span className="absolute right-0 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
              {time}
            </span>
          </div>

          {/* 마지막 채팅 내용 (1줄 말줄임) */}
          <p className="text-sm font-semibold truncate">
            {chatting}
          </p>

          {/* 태그 */}
          <StatusBadge variant="outline" className="w-fit">
            {tag}
          </StatusBadge>

        </div>
      </CardHeader>

      {/* 리뷰 / 나가기 버튼 영역 */}
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
