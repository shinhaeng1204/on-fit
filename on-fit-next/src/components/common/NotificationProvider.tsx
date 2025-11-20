"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { sbClient } from "@/lib/supabase-client";
// ⭐ Dropdown에서 요구하는 Notification 타입과 동일하게 맞춤
export type Notification = {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: string;
};

type NotificationContextValue = {
  notifications: Notification[];
  markAllRead: () => void;
  deleteOne: (id: string) => void;
  markOneRead: (id: string) => void;
};

const NotificationCtx = createContext<NotificationContextValue | null>(null);

function convertTypeToTitle(type: string) {
  switch (type) {
    case "follow":
      return "새 팔로워";
    case "post":
      return "새 게시글";
    case "comment":
      return "새 댓글";
    default:
      return "알림";
  }
}

// ⭐ DB row → Notification 타입으로 변환하는 통합 함수
function mapRowToNotification(raw: any): Notification {
  let msg = raw.message;

  if (raw.type === "post") {
    msg = `새 게시글이 등록되었습니다: ${raw.post_title}`;
  }

  if (raw.type === "comment") {
    msg = `새 댓글: ${raw.comment_text}`;
  }

  return {
    id: String(raw.id),
    message: msg,
    read: raw.read ?? false,
    type: raw.type,
    time: new Date(raw.created_at).toLocaleString(),
    title: convertTypeToTitle(raw.type),
  };
}

export function NotificationProvider({
  children,
  userId,
}: {
  children: React.ReactNode;
  userId: string;
}) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // 📌 1) 최초 알림 불러오기
  useEffect(() => {
    if (!userId) return;

    (async () => {
      const { data } = await sbClient
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      // ⭐ 초기 데이터도 형식 통일
      setNotifications((data ?? []).map(mapRowToNotification));
    })();
  }, [userId]);

  // 📌 2) 실시간 알림 수신
  useEffect(() => {
    if (!userId) return;

    const channel = sbClient
      .channel(`notifications-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const mapped = mapRowToNotification(payload.new);

          setNotifications((prev) => [mapped, ...prev]);
        }
      )
      .subscribe();

    return () => {
      sbClient.removeChannel(channel);
    };
  }, [userId]);

  // 📌 3) 모두 읽음 처리
  const markAllRead = async () => {
    setNotifications((prev) =>
      prev.map((n) => ({
        ...n,
        read: true,
      }))
    );

    const {data} = await sbClient
      .from("notifications")
      .update({ read: true })
      .eq("user_id", userId);
  };
  // 📌 3-A) 개별 읽음 처리 함수
  const markOneRead = async (id: string) => {
    // 1) 클라이언트 상태 업데이트
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, read: true } : n
      )
    );

    // 2) DB 업데이트
    const { data, error } = await sbClient
      .from("notifications")
      .update({ read: true })
      .eq("id", id);

    console.log("UPDATE RESULT", { data, error });
  };

  // 📌 4) 개별 삭제
  const deleteOne = async (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    const {data} = await sbClient
      .from("notifications")
      .delete()
      .eq("id", id);
  };

  return (
    <NotificationCtx.Provider
      value={{ notifications, markAllRead, deleteOne, markOneRead }}
    >
      {children}
    </NotificationCtx.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationCtx);
  if (!ctx)
    throw new Error("useNotifications must be used within NotificationProvider");
  return ctx;
}