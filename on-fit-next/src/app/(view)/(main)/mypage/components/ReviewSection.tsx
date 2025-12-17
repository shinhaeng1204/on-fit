'use client';

import Image from 'next/image';
import { useMemo, useState } from 'react';
import { CardHeader, CardTitle, CardContent } from '@/components/common/Card';
import { Review } from '@/types/review';
import { cn } from '@/lib/utils';

interface ReviewSectionProps {
  reviews: Review[];
  className?: string;
}

export default function ReviewSection({ reviews, className }: ReviewSectionProps) {
  // review.id별로 펼침 상태 저장
  const [expandedMap, setExpandedMap] = useState<Record<string, boolean>>({});

  // 이미지 깨짐 상태(리뷰별)
  const [brokenMap, setBrokenMap] = useState<Record<string, boolean>>({});

  const toggle = (id: string) => {
    setExpandedMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const markBroken = (id: string) => {
    setBrokenMap((prev) => ({ ...prev, [id]: true }));
  };

  return (
    <>
      <CardHeader>
        <CardTitle>받은 후기</CardTitle>
      </CardHeader>

      <CardContent className={cn('pb-5', className)}>
        {reviews.length === 0 ? (
          <div className="flex min-h-20 items-center justify-center rounded-lg border border-dashed border-border bg-muted/40 px-3 py-6">
            <p className="text-sm text-muted-foreground">아직 받은 후기가 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => {
              const isExpanded = !!expandedMap[review.id];

              const nickname = review.reviewer?.nickname ?? '익명';
              const initial = (nickname.trim()[0] ?? '?').toUpperCase();

              const rawUrl = review.reviewer?.profile_image ?? '';
              const imageUrl = rawUrl.trim() ? rawUrl.trim() : null;

              const isBroken = !!brokenMap[review.id];
              const showImage = !!imageUrl && !isBroken;

              return (
                <div
                  key={review.id}
                  className="rounded-lg bg-secondary/30 p-4 transition-colors"
                >
                  {/* 상단 메타 */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      {/* ✅ Avatar */}
                      <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-muted">
                        {showImage ? (
                          <Image
                            src={imageUrl}
                            alt=""
                            fill
                            sizes="36px"
                            className="object-cover"
                            onError={() => markBroken(review.id)}
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-muted-foreground">
                            {initial}
                          </div>
                        )}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{nickname}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {review.room?.name ? `모임명: ${review.room.name}` : '모임 정보 없음'}
                        </p>
                      </div>
                    </div>

                    <span className="shrink-0 text-xs text-muted-foreground">
                      {formatDate(review.created_at)}
                    </span>
                  </div>

                  {/* 본문 */}
                  <div className="mt-3">
                    <p
                      className={cn(
                        'text-sm text-foreground/90 whitespace-pre-wrap',
                        'break-words [overflow-wrap:anywhere]',
                        !isExpanded && 'line-clamp-3',
                      )}
                    >
                      {review.content}
                    </p>

                    {/* 더보기/접기 */}
                    <div className="mt-2">
                      <button
                        type="button"
                        onClick={() => toggle(review.id)}
                        className="text-xs font-medium text-primary hover:opacity-80"
                      >
                        {isExpanded ? '접기' : '더보기'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </>
  );
}

function formatDate(raw: string) {
  const dateOnly = raw.split('T')[0];
  const [y, m, d] = dateOnly.split('-');
  return `${y}.${m}.${d}`;
}
