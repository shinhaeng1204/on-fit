'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { CardContent } from '@/components/common/Card';
import { cn } from '@/lib/utils';
import { Check, Edit2, X } from 'lucide-react';
import { useToast } from '@/app/mypage/components/Toast';
import { updateNicknameDirect } from '@/app/mypage/actions';
import ProfileImage from '@/components/common/ProfileImage';
import FollowListModal from '@/app/mypage/components/FollowListModal';
import type { FollowUser, MyPageStats } from '@/app/mypage/types';

type Props = {
  name: string;
  avatarUrl?: string;
  stats: MyPageStats;
  followers: FollowUser[];
  followings: FollowUser[];
  className?: string;
};

export default function ProfileHeader({
  name,
  avatarUrl,
  stats,
  followers,
  followings,
  className,
}: Props) {
  const { show } = useToast();

  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState(name);
  const [temp, setTemp] = useState(name);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  // 팔로워 / 팔로잉 모달 상태
  const [openMode, setOpenMode] = useState<'followers' | 'followings' | null>(
    null,
  );

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const initial = displayName?.[0] ?? 'U';

  const onSave = () => {
    const next = temp.trim();
    if (!next || next === displayName) {
      setEditing(false);
      setTemp(displayName);
      return;
    }

    startTransition(async () => {
      try {
        await updateNicknameDirect(next);
        setDisplayName(next);
        setEditing(false);
        show('닉네임이 변경됐습니다.');
      } catch (err) {
        console.error(err);
        show('닉네임 변경에 실패했습니다. 잠시 후 다시 시도해주세요.');
      }
    });
  };

  const onCancel = () => {
    setEditing(false);
    setTemp(displayName);
  };

  const openFollowers = () => setOpenMode('followers');
  const openFollowings = () => setOpenMode('followings');
  const closeModal = () => setOpenMode(null);

  return (
    <>
      <CardContent className={cn('pt-6', className)}>
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
          <ProfileImage
            src={avatarUrl}
            profileName={initial}
            containerClassName="relative inline-flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-primary"
            imageClassName="h-full w-full object-cover transition-opacity duration-300"
            alt={displayName}
            fakeProfileClassName="absolute inset-0 flex items-center justify-center select-none text-2xl font-semibold transition-opacity duration-300"
          />

          <div className="w-full flex-1 text-center sm:text-left">
            {/* 닉네임 + 수정 버튼 */}
            <div className="flex items-center justify-center gap-2 sm:justify-start">
              {!editing ? (
                <>
                  <h2 className="max-w-[16ch] truncate text-xl font-semibold sm:text-2xl">
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
                      'focus:ring-2 focus:ring-primary/40',
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

            {/* 통계: 진행중 / 완료 / 팔로워 / 팔로잉 */}
            <div className="mt-4 grid grid-cols-4 gap-4">
              <StatBox label="진행중" value={stats.activeCount} />
              <StatBox label="완료" value={stats.completedCount} />

              {/* 팔로워: 클릭 시 모달 */}
              <button
                type="button"
                onClick={openFollowers}
                className="rounded-lg bg-secondary/30 p-3 text-center transition-colors hover:bg-secondary/50"
              >
                <p className="text-2xl font-bold text-primary">
                  {stats.followerCount}
                </p>
                <p className="text-xs text-muted-foreground">팔로워</p>
              </button>

              {/* 팔로잉: 클릭 시 모달 */}
              <button
                type="button"
                onClick={openFollowings}
                className="rounded-lg bg-secondary/30 p-3 text-center transition-colors hover:bg-secondary/50"
              >
                <p className="text-2xl font-bold text-primary">
                  {stats.followingCount}
                </p>
                <p className="text-xs text-muted-foreground">팔로잉</p>
              </button>
            </div>
          </div>
        </div>
      </CardContent>

      {/* 팔로워 / 팔로잉 목록 모달 */}
      {openMode && (
        <FollowListModal
          open
          mode={openMode}
          users={openMode === 'followers' ? followers : followings}
          onClose={closeModal}
        />
      )}
    </>
  );
}

function StatBox({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-secondary/30 p-3 text-center">
      <p className="text-2xl font-bold text-primary">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
