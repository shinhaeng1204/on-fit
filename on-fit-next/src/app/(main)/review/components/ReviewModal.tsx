"use client";

import { useState } from "react";
import { api } from "@/lib/axios";
import { Button } from "@/components/common/Button";
import { TextArea } from "@/components/common/TextArea";
import {
  Modal,
  ModalHeader,
  ModalContent,
  ModalFooter,
} from "@/components/common/Modal";

type ReviewMember = {
  userId: string;
  nickname: string;
  profileImage: string | null;
  role: string;
};

interface ReviewModalProps {
  open: boolean;
  roomId: string;
  targetMember: ReviewMember | null;
  onClose: () => void;
}

export default function ReviewModal({
  open,
  roomId,
  targetMember,
  onClose,
}: ReviewModalProps) {
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  if (!targetMember) return null;

  const handleSubmit = async () => {
    if (!content.trim()) return;

    try {
      setSaving(true);

      await api.post("/api/review", {
        targetUserId: targetMember.userId,
        roomId,
        content,
      });

      // 성공 후 초기화 + 모달 닫기
      setContent("");
      onClose();
    } catch (err) {
      console.error(err);
      alert("리뷰를 저장하는 데 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (saving) return;
    setContent("");
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      size="md"
      closeOnBackdrop={true}
      className="p-0" // Card 기본 padding 제거하고 내부에서 컨트롤하고 싶으면
    >
      <ModalHeader className="border-b px-6 py-4">
        <h2 className="text-base font-semibold">
          {targetMember.nickname} 님을 칭찬해볼까요? 👏
        </h2>
      </ModalHeader>

      <ModalContent className="px-6 py-4">
        <TextArea
          className="w-full min-h-[120px]"
          placeholder="어떤 점이 좋았는지 남겨주세요 :)"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      </ModalContent>

      <ModalFooter className="flex justify-end gap-2 border-t px-6 py-3">
        <Button
          variant="outline"
          type="button"
          onClick={handleClose}
          disabled={saving}
        >
          취소
        </Button>
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={saving || !content.trim()}
        >
          {saving ? "저장 중..." : "칭찬 남기기"}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
