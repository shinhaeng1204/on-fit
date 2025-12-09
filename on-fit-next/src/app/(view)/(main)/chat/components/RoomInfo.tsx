'use client'

import {Calendar, MapPin, Users, UserMinus} from "lucide-react";
import { toKstDate, toKstTime } from "@/lib/dateFormatter";
import { useEffect, useState } from "react";
import { RoomInfoData } from "@/types/chat";
import { api } from "@/lib/axios";
import {useRouter} from "next/navigation";
import Header from "@/components/common/Header";
import { Button } from "@/components/common/Button";
import ChatParticipants from "@/app/(view)/(main)/chat/components/ChatParticipants";
import {AnimatePresence} from "framer-motion";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";

interface RoomInfoProps {
  roomId : string
}

export default function RoomInfo({roomId} : RoomInfoProps) {
  const queryClient = useQueryClient()
  const router = useRouter();
  const [open, setOpen] = useState<boolean>(false);

  const { data: roomInfo, isLoading, error } = useQuery<RoomInfoData>({
    queryKey: ["post", roomId],
    queryFn: async () => {
      const res = await api.get(`/api/chat/${roomId}`);
      return res.data.post;
    },
    enabled: !!roomId, // roomId 없으면 요청 안 보냄
  });

  const leaveMutation = useMutation({
    mutationFn: async () => {
      await api.delete(`/api/chat/${roomId}/leave`);
    },

    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["post", roomId] });
      await queryClient.cancelQueries({ queryKey: ["posts"] });

      const prevPost = queryClient.getQueryData<RoomInfoData>(["post", roomId]);
      const prevPosts = queryClient.getQueryData<any>(["posts"]); // infiniteQuery data

      // 1) 상세 페이지 낙관적 업데이트
      if (prevPost) {
        queryClient.setQueryData<RoomInfoData>(["post", roomId], {
          ...prevPost,
          current_participants: Math.max(prevPost.current_participants - 1, 0),
        });
      }

      // 2) 메인 목록 낙관적 업데이트
      if (prevPosts) {
        queryClient.setQueryData(["posts"], {
          ...prevPosts,
          pages: prevPosts.pages.map((page: any) => ({
            ...page,
            items: page.items.map((item: any) =>
              item.room_id === roomId
                ? {
                  ...item,
                  current_participants: Math.max(
                    item.current_participants - 1,
                    0
                  ),
                }
                : item
            ),
          })),
        });
      }

      return { prevPost, prevPosts };
    },

    onError: (_err, _vars, context) => {
      // 롤백
      if (context?.prevPost)
        queryClient.setQueryData(["post", roomId], context.prevPost);

      if (context?.prevPosts)
        queryClient.setQueryData(["posts"], context.prevPosts);

      alert("나가기 실패! 다시 시도해주세요.");
    },

    onSettled: async () => {
      // 서버 값 재정확화
      await queryClient.invalidateQueries({ queryKey: ["post", roomId] });
      await queryClient.invalidateQueries({ queryKey: ["posts"] });
      router.push("/");
    },
  });

  const handleLeave = () => {
    const ok = confirm("정말 채팅방을 나가시겠습니까?");
    if (!ok) return;
    leaveMutation.mutate();
  };

  return (
    <>
      <Header
        variant="back"
        title="뒤로"
        containerClassName="bg-card/80 backdrop-blur-sm border-b border-border"
        right={
          <>
            <Button
              variant="ghost"
              size="inherit"
              leftIcon={(<Users />)}
              onClick={() => setOpen(prev => !prev)}
              className="block flex justify-start px-2 py-1 cursor-pointer">
              참여자 보기
            </Button>

            <Button
              variant="ghost"
              size="inherit"
              leftIcon={(<UserMinus/>)}
              onClick={() => handleLeave()}
              className="block flex justify-start text-destructive px-2 py-1 mt-1 cursor-pointer">
               나가기
            </Button>
          </>
        }
      />
      {open && (
        <>
          <div
            onClick={() => setOpen(false)}
            className="fixed inset-0 bg-black/30 z-40"
          />
          <AnimatePresence>
              <ChatParticipants roomId={roomId} onClose={() => setOpen(false)}/>
          </AnimatePresence>
        </>
      )}

      {/* 채팅방 정보 */}
      <div className="bg-card/50 border-b border-border">
        <div className="container mx-auto px-4 py-3 flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4"/>
            <p>{roomInfo?.location}</p>
          </div>

          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4"/>
            {roomInfo?.created_at && (
              <p>
                {toKstDate(roomInfo.created_at)}{" "}
                {toKstTime(roomInfo.created_at)}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="h-4 w-4" />
            <p>
              {roomInfo?.current_participants}/{roomInfo?.max_participants}명
            </p>
          </div>
        </div>
      </div>

      {/* 개설 주최자 소개 */}
      <div className="flex justify-center mt-4">
        <span className="bg-secondary/50 text-muted-foreground text-xs px-3 py-1 rounded-full">
          {roomInfo?.host?.nickname ?? "알수없음"}님이 채팅방을 개설했습니다.
        </span>
      </div>
    </>
  );
}
