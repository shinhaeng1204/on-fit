'use client';

import { api } from '@/lib/axios';
import ChatRoomCard from './ChatRoomCard';
import ChatRoomCardSkeleton from "@/app/(view)/(main)/chat/components/ChatRoomCardSkeleton";
import {useQuery, useQueryClient} from "@tanstack/react-query";

interface ChatRoomListItem {
  roomId: string;
  title: string;
  sport?: string | null;
  tag?: string | null;
  currentParticipants: number;
  lastMessage: string;
  lastMessageTime: string;
  role: 'host' | 'member' | string;
  unreadCount: number;
  recruitEndAt?: string | null;
  canReview: boolean;
}

export default function ChatRoomList() {
  const queryClient = useQueryClient();
  const { data: rooms = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['chatRooms'],
    queryFn: async () => {
      const res = await api.get('/api/chat/rooms');
      return (res.data.items ?? []);
    },
  });

  // 시간 포맷 (원하면 나중에 따로 분리해도 됨)
  const formatTime = (iso: string) => {
    if (!iso) return '';
    return new Date(iso).toLocaleTimeString('ko-KR', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const handleReadRoom = (roomId: string) => {
    queryClient.setQueryData(['chatRooms'], (old?:ChatRoomListItem[]) =>
    (old ?? []).map(r =>
      r.roomId === roomId ? {...r, unreadCount: 0} : r
    ))
  }

  // 방 나가기 후 캐시 업데이트
  const handleLeaveRoom = (roomId: string) => {
    // Optimistic Update: 서버 응답 기다리지 않고 UI에서 제거
    queryClient.setQueryData(['chatRooms'], (old?: ChatRoomListItem[]) =>
      old?.filter((r) => r.roomId !== roomId) ?? []
    );
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 items-center mt-5">
        <ChatRoomCardSkeleton />
        <ChatRoomCardSkeleton />
        <ChatRoomCardSkeleton />
        <ChatRoomCardSkeleton />
      </div>
    );
  }

  if (isError) {
    return <div className="p-4 text-sm text-red-500">{isError}</div>;
  }

  if (rooms.length === 0) {
    return (
      <div className="p-4 text-sm text-muted-foreground">
        참여 중인 채팅방이 아직 없어요.
      </div>
    );
  }

  return (
    <div className="mt-5 flex items-center flex-col gap-6">
      {rooms.map((room : ChatRoomListItem) => (
        <ChatRoomCard
          key={room.roomId}
          roomId={room.roomId}
          title={room.title}
          member={room.currentParticipants}
          time={formatTime(room.lastMessageTime)}
          chatting={room.lastMessage}
          tag={room.tag ?? room.sport ?? ''}
          unreadCount={room.unreadCount}
          canReview={room.canReview}
          onLeave={handleLeaveRoom}
          onRead={handleReadRoom}
        />
      ))}
    </div>
  );
}
