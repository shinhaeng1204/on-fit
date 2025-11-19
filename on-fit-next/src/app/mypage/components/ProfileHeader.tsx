'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { CardContent } from '@/components/common/Card';
import LevelBadge from '@/components/common/Badge';
import { cn } from '@/lib/utils';
import { Check, Edit2, X } from 'lucide-react';
import { useToast } from '@/app/mypage/components/Toast';
import { updateNicknameDirect } from '@/app/mypage/actions';
import ProfileImage from "@/components/common/ProfileImage";
import {BadgeType} from "@/types/post";

type Props = {
  name: string;
  avatarUrl?: string;
  level: BadgeType;
  stats: {
    participationCount: number;
    followerCount: number;
    followingCount: number;
  };
  className?: string;
};

export default function ProfileHeader({
  name,
  avatarUrl,
  level,
  stats,
  className,
}: Props) {
  const { show } = useToast();

  // ✅ 이미지 로드 실패 여부
  const [imgError, setImgError] = useState(false);

  // ✅ 닉네임 편집 상태
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState(name);
  const [temp, setTemp] = useState(name);

  // ✅ Transition으로 서버 액션 호출 시 UI 반응 제어
  const [isPending, startTransition] = useTransition();

  // ✅ 닉네임 입력창 자동 포커스
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const initial = displayName?.[0] ?? 'U';

  // ✅ 닉네임 저장
  const onSave = () => {
    const next = temp.trim();
    if (!next || next === displayName) {
      setEditing(false);
      setTemp(displayName);
      return;
    }

    startTransition(async () => {
      try {
        await updateNicknameDirect(next); // ✅ 서버 액션으로 DB 업데이트
        setDisplayName(next);
        setEditing(false);
        show('닉네임이 변경됐습니다.');
      } catch (err) {
        console.error(err);
        show('닉네임 변경에 실패했습니다. 잠시 후 다시 시도해주세요.');
      }
    });
  };

  // ✅ 취소 시 상태 복구
  const onCancel = () => {
    setEditing(false);
    setTemp(displayName);
  };

  return (
    <CardContent className={cn('pt-6', className)}>
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
        {/* 아바타 */}
        <ProfileImage src={avatarUrl}
                      profileName={initial}
                      containerClassName="relative inline-flex h-24 w-24 items-center justify-center rounded-full overflow-hidden bg-primary/10 text-primary"
                      imageClassName="h-full w-full object-cover transition-opacity duration-300"
                      alt={displayName}
                      fakeProfileClassName="absolute inset-0 flex items-center justify-center text-2xl font-semibold select-none transition-opacity duration-300"/>
        {/* 닉네임 + 레벨 + 통계 */}
        <div className="flex-1 text-center sm:text-left w-full">
          {/* 🔹 닉네임 (수정 모드 포함) */}
          <div className="flex items-center justify-center sm:justify-start gap-2">
            {!editing ? (
              <>
                <h2 className="text-xl sm:text-2xl font-semibold truncate max-w-[16ch]">
                  {displayName}
                </h2>
                <button
                  type="button"
                  aria-label="닉네임 수정"
                  onClick={() => setEditing(true)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-foreground/5"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  value={temp}
                  onChange={(e) => setTemp(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') onSave();
                    if (e.key === 'Escape') onCancel();
                  }}
                  className={cn(
                    'h-9 rounded-md border border-border bg-background px-3 text-base outline-none',
                    'focus:ring-2 focus:ring-primary/40'
                  )}
                  maxLength={20}
                  placeholder="닉네임 입력"
                  aria-label="닉네임 입력"
                  disabled={isPending}
                />
                <button
                  type="button"
                  onClick={onSave}
                  aria-label="저장"
                  disabled={isPending}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-primary/15 hover:bg-primary/25"
                >
                  <Check className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={onCancel}
                  aria-label="취소"
                  disabled={isPending}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-foreground/5"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          {/* 🔹 레벨 뱃지 */}
          <div className="mt-2 mb-4">
            <LevelBadge type={level} />
          </div>

          {/* 🔹 통계 */}
          <div className="grid grid-cols-3 gap-4">
            <StatBox label="참여" value={stats.participationCount} />
            <StatBox label="팔로워" value={stats.followerCount} />
            <StatBox label="팔로잉" value={stats.followingCount} />
          </div>
        </div>
      </div>
    </CardContent>
  );
}

function StatBox({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-center p-3 bg-secondary/30 rounded-lg">
      <p className="text-2xl font-bold text-primary">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
