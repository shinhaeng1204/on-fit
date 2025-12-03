"use client";

import { Bell, X } from "lucide-react";
import { Button } from "./Button";
import { Popover, PopoverContent, PopoverTrigger } from "./PopOver"
import { ScrollArea } from "./ScrollArea";
import StatusBadge from "../main/StatusBadge";
import Link from "next/link";
import { User } from "@supabase/supabase-js";
import { sbClient } from "@/lib/supabase-client";
import { useRouter } from "next/navigation";

// 알림 타입 정의
export interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;       // "5분 전" 같은 문자열
  read: boolean;
  type: string;
  post_id?:string;
  room_id?:string;
}

interface Props {
  notifications: Notification[];
  onMarkAllRead: () => void;
  onDelete: (id: string) => void;
  onMarkOneRead: (id: string) => void;
  deleteAll: ()=>void;
  user:User|null;
}

export const NotificationDropdown = ({
  notifications,
  onMarkAllRead,
  onDelete,
  onMarkOneRead,
  deleteAll,
  user
}: Props) => {
  const unreadCount = notifications.filter((n) => !n.read).length;
  const router = useRouter();

  return (
    <Popover>
      {/* 알림 버튼 */}
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" title="알림" className="relative cursor-pointer">
          <Bell className="h-5 w-5" />

          {unreadCount > 0 && (
            <StatusBadge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {unreadCount}
            </StatusBadge>
          )}
        </Button>
      </PopoverTrigger>

      {/* 알림 팝업 */}
      <PopoverContent
        className="w-80 p-0 bg-card border-border z-50"
        align="end"
      >
        {/* 상단 헤더 */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="font-semibold text-lg">알림</h3>

          <div className="flex gap-2">
            {notifications.length > 0 && (
              <>
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs h-7"
                    onClick={onMarkAllRead}
                  >
                    모두 읽음
                  </Button>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs h-7 text-destructive"
                  onClick={deleteAll}
                >
                  전체 삭제
                </Button>
              </>
            )}
          </div>
        </div>

        {/* 내용 스크롤 영역 */}
        <ScrollArea className="h-[400px]">
          {notifications.length === 0 ? (
            // 알림 없을 때
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Bell className="h-12 w-12 mb-2 opacity-50" />
              <p className="text-sm">알림이 없습니다</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {notifications.map((notification) => {
                const href =
                  notification.type === "chat" && (notification as any).room_id
                    ? `/chat/${(notification as any).room_id}`
                    : notification.type === "post" && (notification as any).post_id
                    ? `/post/${(notification as any).post_id}`
                    : "#";

                return (
                  <Link
                    key={notification.id}
                    href={href}
                    onClick={async (e) => {
                      e.preventDefault();

                      // 1) 클릭 시 읽음 처리 (프론트)
                      onMarkOneRead(notification.id);

                      // 2) 채팅 알림이면 Supabase messages.read_by 업데이트
                      if (notification.type === "chat" && notification.room_id) {
                        const userId = user?.id;
                        if (!userId) return;

                        // 1) 메시지 목록 가져오기
                        const { data: messages, error } = await sbClient
                          .from("messages")
                          .select("id, read_by")
                          .eq("room_id", notification.room_id)
                          .neq("sender_id", userId);

                        if (error) {
                          console.error(error);
                          return;
                        }

                        // 2) 각 메시지마다 read_by 업데이트
                        for (const msg of messages) {
                          const nextReadBy = Array.isArray(msg.read_by)
                            ? msg.read_by.includes(userId)
                              ? msg.read_by
                              : [...msg.read_by, userId]
                            : [userId];

                          await sbClient
                            .from("messages")
                            .update({ read_by: nextReadBy })
                            .eq("id", msg.id);
                        }
                      }
                      router.push(href);
                    }}
                    className={`block p-4 hover:bg-accent/50 transition-colors ${
                      !notification.read ? "bg-accent/20" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">

                      {/* 읽음 표시 점 */}
                      <div
                        className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${
                          !notification.read ? "bg-primary" : "bg-transparent"
                        }`}
                      />

                      {/* 텍스트 영역 */}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm mb-1">
                          {notification.title}
                        </p>

                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {notification.message}
                        </p>

                        <p className="text-xs text-muted-foreground mt-1">
                          {notification.time}
                        </p>
                      </div>

                      {/* 삭제 버튼 (Link 이벤트 방해하지 않도록 stopPropagation) */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 flex-shrink-0"
                        title="삭제"
                        onClick={(e) => {
                          e.preventDefault();      // 링크 이동 막기
                          e.stopPropagation();     // 상위 Link 클릭 막기
                          onDelete(notification.id);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>

                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};