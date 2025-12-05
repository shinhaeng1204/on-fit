'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/axios';
import ChatRoomCard from './ChatRoomCard';
import ChatRoomCardSkeleton from "@/app/(view)/(main)/chat/components/ChatRoomCardSkeleton";

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
  const [rooms, setRooms] = useState<ChatRoomListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 시간 포맷 (원하면 나중에 따로 분리해도 됨)
  const formatTime = (iso: string) => {
    if (!iso) return '';
    return new Date(iso).toLocaleTimeString('ko-KR', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await api.get('/api/chat/rooms');
        setRooms(res.data.items ?? []);
      } catch (err) {
        console.error('채팅방 리스트 불러오기 실패', err);
        setError('채팅방 리스트를 불러오는데 실패했어요.');
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col gap-4 items-center mt-5">
        <ChatRoomCardSkeleton />
        <ChatRoomCardSkeleton />
        <ChatRoomCardSkeleton />
        <ChatRoomCardSkeleton />
      </div>
    );
  }

  if (error) {
    return <div className="p-4 text-sm text-red-500">{error}</div>;
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
      {rooms.map((room) => (
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
          onLeave={(id) => {
            setRooms((prev) => prev.filter((r) => r.roomId !== id))
          }}
        />
      ))}
    </div>
  );
}
