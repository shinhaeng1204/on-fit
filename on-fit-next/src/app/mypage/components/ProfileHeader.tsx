'use client';
import { CardContent } from '@/components/common/Card';
import LevelBadge from '@/components/common/Badge';
import { cn } from '@/lib/utils';
import { useState } from 'react';

type Props = {
  name: string;
  avatarUrl?: string;
  level: 'bronze' | 'silver' | 'gold' | 'platinum';
  stats: {
    participationCount: number;
    followerCount: number;
    followingCount: number;
  };
  className?: string;
};

export default function ProfileHeader({ name, avatarUrl, level, stats, className }: Props) {
  const [imgError, setImgError] = useState(false);
  const initial = name?.[0] ?? 'U';

  return (
    <CardContent className={cn('pt-6', className)}>
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <div
          className="relative inline-flex h-24 w-24 items-center justify-center rounded-full overflow-hidden bg-primary/10 text-primary"
          aria-label={name}
          role="img"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={avatarUrl || '/default-avatar.png'}
            alt={name}
            className={cn(
              'h-full w-full object-cover transition-opacity duration-300',
              (imgError || !avatarUrl) && 'opacity-0'
            )}
            onError={() => setImgError(true)}
          />
          <span
            className={cn(
              'absolute inset-0 flex items-center justify-center text-2xl font-semibold select-none transition-opacity duration-300',
              (!imgError && avatarUrl) ? 'opacity-0' : 'opacity-100'
            )}
          >
            {initial}
          </span>
        </div>

        {/* 레벨 뱃지 + 통계 */}
        <div className="flex-1 text-center sm:text-left">
          <div className="mt-4 sm:mt-0 mb-4">
            <LevelBadge type={level} />
          </div>
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
