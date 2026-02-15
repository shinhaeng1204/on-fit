"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/axios";
import ReviewList from "../components/ReviewList";
import ReviewModal from "../components/ReviewModal";
import ReportModal from "@/app/(view)/(main)/post/components/ReportModal";

type ReviewMember = {
  userId: string;
  nickname: string;
  profileImage: string | null;
  role: string;
};

export default function ReviewPage() {
  const params = useParams();
  const roomId = params?.roomId as string;

  const [members, setMembers] = useState<ReviewMember[]>([]);
  const [selectedMember, setSelectedMember] = useState<ReviewMember | null>(null);
  const [loading, setLoading] = useState(true);       
  const [error, setError] = useState<string | null>(null);
  const [completed, setCompleted] = useState<string[]>([])

  const [reportTarget, setReportTarget] = useState<ReviewMember | null>(null);

  useEffect(() => {
    if (!roomId) return;

    async function fetchMembers() {
      try {
        const res = await api.get("/api/chat/participants", {
          params: { roomId },
        });

        const members: ReviewMember[] = res.data.items ?? [];
        setMembers(members);
        setCompleted(res.data.completed)
      } catch (e) {
        console.error(e);
        setError("참여자 정보를 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    }

    fetchMembers();
  }, [roomId]);

  const handlePraise = (member: ReviewMember) => {
    setSelectedMember(member);
    // TODO: 모달 열고 /api/reviews POST
  };

  const handlePraiseComplete = (userId: string) => {
    setCompleted((prev) => [...prev, userId]);
  };

  const handleReport = (member: ReviewMember) => {
    setReportTarget(member);
  };

  if (loading) {
    return (
      <div className="p-4 text-sm text-muted-foreground">
        멤버를 불러오는 중…
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-sm text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="py-6">
      <h1 className="px-4  mb-2 text-xl font-semibold text-center ">
        함께 운동한 멤버들에게 
      </h1>
      <h3 className="text-muted-foreground text-center mb-8">칭찬을 남겨보세요 💪</h3>

      <ReviewList members={members} onPraise={handlePraise} completed={completed} onReport={handleReport} />

 
      <ReviewModal
        open={!!selectedMember}
        roomId={roomId}
        targetMember={selectedMember}
        onClose={() => setSelectedMember(null)}
        onComplete={handlePraiseComplete}
      />

      {/* 신고 모달 */}
      <ReportModal
        isOpen={!!reportTarget}
        roomId={roomId}
        targetUserId={reportTarget?.userId ?? ""}
        postTitle={reportTarget?.nickname ?? ""}
        onClose={() => setReportTarget(null)}
      />
    </div>
  );
}
