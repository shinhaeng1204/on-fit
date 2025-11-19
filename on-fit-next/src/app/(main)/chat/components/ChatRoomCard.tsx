'use client'
import { Card, CardHeader } from "@/components/common/Card";
import Image from "next/image";
import StatusBadge from "@/components/main/StatusBadge";
import { useRouter } from "next/navigation";
import { api } from "@/lib/axios"; // 🔹 추가

type ChatRoomCardProps = {
  title: string;
  member: number;
  time: string;
  chatting: string;
  tag: string;
  roomId: string;
  unreadCount: number;
};

export default function ChatRoomCard({
  roomId,
  title,
  member,
  time,
  chatting,
  tag,
  unreadCount,
}: ChatRoomCardProps) {
  const router = useRouter();

  const handleChatRoomCard = () => {
    // 🔹 방 입장 순간 읽음 처리 호출
    api
      .post("/api/chat/read", { roomId })
      .catch((err) => {
        console.error("read 처리 실패", err);
      });

    router.push(`/chat/${roomId}`);
  };

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
            className="rounded-xl"
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

        <div className="gap-2 flex-1">
          <div className="flex flex-row gap-2">
            <h3 className="font-bold text-ellipsis md:w-full whitespace-nowrap overflow-hidden">
              {title}
            </h3>
            <StatusBadge variant="outline">{member}</StatusBadge>
            <span className="text-xs absolute right-3">{time}</span>
          </div>

          <h3 className="text-sm font-semibold mb-2 mt-2">{chatting}</h3>
          <StatusBadge variant="outline">{tag}</StatusBadge>
        </div>
      </CardHeader>
    </Card>
  );
}
