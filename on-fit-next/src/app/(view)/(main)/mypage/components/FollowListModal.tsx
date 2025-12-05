'use client';

import { X } from 'lucide-react';
import type { FollowUser } from '@/app/(view)/(main)/mypage/types';
import ProfileImage from '@/components/common/ProfileImage';
import LevelBadge from '@/components/common/Badge';

type Props = {
  open: boolean;
  mode: 'followers' | 'followings';
  users: FollowUser[];
  onClose: () => void;
};

export default function FollowListModal({ open, mode, users, onClose }: Props) {
  if (!open) return null;

  const title = mode === 'followers' ? '팔로워 보기' : '팔로잉 보기';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-2xl bg-card p-4 shadow-xl">
        {/* 헤더 */}
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-foreground/5"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* 내용 */}
        {users.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            아직 {mode === 'followers' ? '팔로워가 없어요.' : '팔로잉한 유저가 없어요.'}
          </p>
        ) : (
          <ul className="max-h-72 space-y-2 overflow-y-auto">
            {users.map((user) => {
              const initial = user.nickname?.[0] ?? 'U';

              return (
                <li
                  key={user.id}
                  className="flex items-center justify-between rounded-xl px-3 py-2 hover:bg-foreground/5"
                >
                  {/* 왼쪽: 아이콘 + 이름 + 서브텍스트 */}
                  <div className="flex items-center gap-3">
                    <ProfileImage
                      src={user.avatarUrl ?? undefined}
                      profileName={initial}
                      containerClassName="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-primary"
                      imageClassName="h-full w-full object-cover"
                      alt={user.nickname}
                      fakeProfileClassName="absolute inset-0 flex items-center justify-center text-sm font-semibold"
                    />

                    <div className="flex flex-col">
                      <span className="text-sm font-medium">
                        {user.nickname ?? '이름 없음'}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {mode === 'followers' ? '팔로워' : '팔로잉'}
                      </span>
                    </div>
                  </div>

                  {/* 오른쪽: 트로피/배지 */}
                  <LevelBadge type={user.mainBadgeLevel} className="shrink-0" />
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
