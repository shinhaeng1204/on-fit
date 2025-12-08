'use client';

import { useEffect, useState } from 'react';
import { X, MapPin, Calendar, Award } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import Badge from '@/components/common/Badge';
import type { Profile } from '@/types/profilemodal';
import { sbClient } from '@/lib/supabase-client';

type ProfileModalProps = {
  open: boolean;
  onClose: () => void;
  profile: Profile | null;
  setProfile: React.Dispatch<React.SetStateAction<Profile | null>>;
};

type ProfileStats = {
  joinedCount: number;
  createdCount: number;
  followerCount: number;
  followingCount: number;
};

type DetailedProfile = Profile & {
  profile_image?: string | null;
  location?: string | null;
  sport_preference?: string[];
  stats?: ProfileStats;
  badges?: { id: string; name: string; description?: string }[];
};

export default function ProfileModal({
  open,
  onClose,
  profile,
  setProfile,
}: ProfileModalProps) {
  const [userId, setUserId] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [detail, setDetail] = useState<DetailedProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  /** 현재 로그인한 유저 ID */
  useEffect(() => {
    const getUser = async () => {
      const { data } = await sbClient.auth.getUser();
      setUserId(data.user?.id ?? null);
    };
    getUser();
  }, []);

  /**
   * 프로필 상세 가져오기
   * ❗ profile.id === 'undefined' 인 경우도 차단
   */
  useEffect(() => {
    if (!open) return;
    if (!profile?.id) return;
    if (profile.id === 'undefined') {
      console.error('[ProfileModal] profile.id is "undefined". Fetch blocked.');
      return;
    }

    const url = `/api/profile-modal/${profile.id}`;
    console.log('[ProfileModal] Fetch URL =', url);

    let cancelled = false;

    const fetchProfile = async () => {
      try {
        setError(null);

        const res = await fetch(url);

        if (!res.ok) {
          const text = await res.text();
          console.error('profile-modal API error', res.status, text);
          setError('프로필 정보를 불러오지 못했습니다.');
          return;
        }

        const data = (await res.json()) as DetailedProfile;
        if (!cancelled) setDetail(data);
      } catch (e) {
        console.error('profile-modal fetch error', e);
        if (!cancelled) {
          setError('프로필 정보를 불러오지 못했습니다.');
        }
      }
    };

    fetchProfile();
    return () => {
      cancelled = true;
    };
  }, [open, profile?.id]);

  /** 초기 팔로우 상태 */
  useEffect(() => {
    (async () => {
      if (!userId || !profile?.id) return;
      if (profile.id === 'undefined') return;

      const { data: me } = await sbClient
        .from('profiles')
        .select('following')
        .eq('id', userId)
        .single();

      const following = (me?.following ?? []) as string[];
      setIsFollowing(following.includes(profile.id));
    })();
  }, [userId, profile?.id]);

  /** ❗ 모달 렌더 자체를 막는 강력한 가드 */
  if (!open || !profile || !profile.id || profile.id === 'undefined') {
    return null;
  }

  const base = (detail ?? (profile as DetailedProfile));

  const joinedCount = base.stats?.joinedCount ?? 0;
  const followerCount =
    base.stats?.followerCount ?? (base.followers?.length ?? 0);
  const followingCount =
    base.stats?.followingCount ?? (base.following?.length ?? 0);

  const region = base.location ?? '설정 안 됨';
  const preferredExercises = base.sport_preference ?? [];
  const badges = base.badges ?? [];

  /** 팔로우 토글 */
  const handleToggleFollow = async () => {
    if (!userId) {
      alert('로그인이 필요합니다.');
      return;
    }

    const prev = isFollowing;
    setIsFollowing(!prev);

    const rpcName = prev ? 'unfollow_user' : 'follow_user';
    const { error: rpcError } = await sbClient.rpc(rpcName, {
      p_target: profile.id,
    });

    if (rpcError) {
      console.error(rpcError);
      setIsFollowing(prev);
      alert(prev ? '언팔로우 실패' : '팔로우 실패');
      return;
    }

    setProfile((old) =>
      old
        ? {
            ...old,
            followers: prev
              ? (old.followers ?? []).filter((uid) => uid !== userId)
              : [...(old.followers ?? []), userId],
          }
        : old,
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="relative w-full max-w-md">
        <Card className="relative max-h-[90vh] overflow-y-auto rounded-3xl border border-border bg-[#111519]/95 px-8 pb-10 pt-6 shadow-2xl backdrop-blur">
          {/* 헤더 */}
          <div className="mb-6 flex items-center justify-between">
            <p className="text-sm font-semibold text-muted-foreground">
              프로필
            </p>

            <div className="flex items-center gap-3">
              {userId !== base.id && (
                <Button
                  variant={isFollowing ? 'outline' : 'sport'}
                  size="sm"
                  onClick={handleToggleFollow}
                >
                  {isFollowing ? '팔로우 취소' : '팔로우'}
                </Button>
              )}

              <button
                type="button"
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-border/70 bg-black/40 hover:bg-white/5"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {error && (
            <p className="mb-3 text-xs text-destructive">{error}</p>
          )}

          {/* 프로필 상단 */}
          <div className="flex items-center gap-8">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/20 text-3xl">
              {base.profile_image ? (
                <img
                  src={base.profile_image}
                  alt={base.nickname}
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                base.nickname.slice(0, 1)
              )}
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <p className="text-2xl font-semibold">{base.nickname}</p>
                <Badge type={base.level ?? '브론즈'} />
              </div>

              <div className="mt-2 flex gap-10 text-center">
                <div>
                  <p className="text-2xl font-semibold text-primary">
                    {joinedCount}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">참여</p>
                </div>
                <div>
                  <p className="text-2xl font-semibold text-primary">
                    {followerCount}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    팔로워
                  </p>
                </div>
                <div>
                  <p className="text-2xl font-semibold text-primary">
                    {followingCount}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    팔로잉
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="my-6 h-px w-full bg-border/60" />

          {/* 활동 지역 */}
          <section className="mb-4 rounded-2xl border border-border/70 bg-black/20 px-5 py-4">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4 text-primary" />
                <span>활동 지역</span>
              </div>
              <p className="text-sm">{region}</p>
            </div>
          </section>

          {/* 선호 종목 */}
          <section className="mb-4 rounded-2xl border border-border/70 bg-black/20 px-5 py-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 text-primary" />
              <span>선호 종목</span>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {preferredExercises.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  아직 선호 종목을 설정하지 않았어요.
                </p>
              ) : (
                preferredExercises.map((label) => (
                  <span
                    key={label}
                    className="rounded-full border border-border/70 bg-black/40 px-3 py-1 text-xs"
                  >
                    {label}
                  </span>
                ))
              )}
            </div>
          </section>

          {/* 획득 뱃지 */}
          <section className="rounded-2xl border border-border/70 bg-black/20 px-5 py-4">
            <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
              <Award className="h-4 w-4 text-primary" />
              <span>획득 뱃지</span>
            </div>

            {badges.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                아직 획득한 뱃지가 없어요.
              </p>
            ) : (
              <ul className="divide-y divide-border/60 text-sm">
                {badges.map((badge) => (
                  <li
                    key={badge.id}
                    className="flex items-center justify-between py-2"
                  >
                    <span>{badge.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {badge.description}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </Card>
      </div>
    </div>
  );
}
