'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { CardContent } from '@/components/common/Card';
import { cn } from '@/lib/utils';
import { Check, Edit2, X } from 'lucide-react';
import { useToast } from '@/app/(view)/(main)/mypage/components/Toast';
import { updateNicknameDirect, updateProfileImage } from '@/app/(view)/(main)/mypage/actions'; // 🔥 NEW
import ProfileImage from '@/components/common/ProfileImage';
import FollowListModal from '@/app/(view)/(main)/mypage/components/FollowListModal';
import type { FollowUser, MyPageStats } from '@/app/(view)/(main)/mypage/types';
import { sbClient } from '@/lib/supabase-client';

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

  // 닉네임 편집 상태
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState(name);
  const [temp, setTemp] = useState(name);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  // 🔥 프로필 이미지 업로드 관련 상태
  const [avatar, setAvatar] = useState<string | undefined>(avatarUrl);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [avatarPending, startAvatarTransition] = useTransition();

  // 팔로워 / 팔로잉 모달 상태
  const [openMode, setOpenMode] = useState<'followers' | 'followings' | null>(
    null,
  );

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  // 🔥 서버에서 avatarUrl이 바뀌면 로컬 상태도 동기화
  useEffect(() => {
    setAvatar(avatarUrl);
  }, [avatarUrl]);

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

  // 🔥 프로필 이미지를 눌렀을 때: 파일 선택창 열기
  const handleAvatarClick = () => {
    if (uploading || avatarPending) return;
    fileInputRef.current?.click();
  };

  // 🔥 파일 선택 시: Supabase Storage 업로드 + DB 업데이트
  const handleAvatarChange: React.ChangeEventHandler<HTMLInputElement> = async (
    e,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      show('이미지 파일만 업로드할 수 있어요.');
      e.target.value = '';
      return;
    }

    try {
      setUploading(true);

      const supabase = sbClient;
      
      const { data, error } = await supabase.auth.getUser();
console.log('user in upload', data, error);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        show('로그인이 필요합니다.');
        return;
      }

      const ext = file.name.split('.').pop() || 'png';
      const filePath = `${user.id}/${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars') // 👉 Storage 버킷 이름
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) {
        console.error(uploadError);
        show('이미지 업로드에 실패했습니다. 잠시 후 다시 시도해주세요.');
        return;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from('avatars').getPublicUrl(filePath);

      // 프리뷰를 바로 바꿔주기
      setAvatar(publicUrl);

      // 서버 액션으로 profiles.profile_image 업데이트
      startAvatarTransition(async () => {
        try {
          await updateProfileImage(publicUrl);
          show('프로필 이미지가 변경됐습니다.');
        } catch (err) {
          console.error(err);
          show('프로필 이미지 저장에 실패했습니다. 잠시 후 다시 시도해주세요.');
        }
      });
    } finally {
      setUploading(false);
      // 같은 파일 다시 선택해도 change 이벤트가 뜨게 초기화
      e.target.value = '';
    }
  };

  const isAvatarBusy = uploading || avatarPending;

  return (
    <>
      <CardContent className={cn('pt-6', className)}>
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
          {/* 🔥 클릭하면 파일 선택창이 열리는 프로필 이미지 */}
          <div className="flex flex-col items-center gap-1 sm:items-start">
            <button
              type="button"
              onClick={handleAvatarClick}
              disabled={isAvatarBusy}
              className={cn(
                'relative inline-flex rounded-full',
                isAvatarBusy && 'opacity-70',
              )}
              aria-label="프로필 이미지 변경"
            >
              <ProfileImage
                src={avatar}
                profileName={initial}
                containerClassName="relative inline-flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-primary"
                imageClassName="h-full w-full object-cover transition-opacity duration-300"
                alt={displayName}
                fakeProfileClassName="absolute inset-0 flex items-center justify-center select-none text-2xl font-semibold transition-opacity duration-300"
              />
              
            </button>

            {/* 숨겨진 파일 input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>

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
