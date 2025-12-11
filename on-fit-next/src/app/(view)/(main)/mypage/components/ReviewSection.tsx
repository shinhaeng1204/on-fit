import { CardHeader, CardTitle, CardContent } from '@/components/common/Card';
import { Review } from '@/types/review';
import { cn } from '@/lib/utils';

interface ReviewSectionProps {
  reviews: Review[];
  className?: string;
}

export default function ReviewSection({ reviews, className }: ReviewSectionProps) {
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
            {reviews.map((review) => (
              <div
                key={review.id}
                className="flex flex-col gap-2 rounded-lg bg-secondary/30 p-4"
              >
                <div className="flex items-center justify-between">
                  {/* 작성자 + 모임명 */}
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 overflow-hidden rounded-full bg-muted">
                      {review.reviewer?.profile_image ? (
                        <img
                          src={review.reviewer.profile_image}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : null}
                    </div>

                    <div className="flex flex-col">
                      <span className="text-sm font-medium">
                        {review.reviewer?.nickname ?? '익명'}
                      </span>

                      {/* ✅ room name 표시 (없으면 기본 텍스트) */}
                      <span className="text-xs text-muted-foreground">
                        {review.room?.name ? `모임명: ${review.room.name}` : '모임 정보 없음'}
                      </span>
                    </div>
                  </div>

                  {/* 날짜 */}
                  <span className="text-xs text-muted-foreground">
                    {formatDate(review.created_at)}
                  </span>
                </div>

                {/* 후기 내용 */}
                <p className="text-sm text-foreground/90 whitespace-pre-wrap break-all">
                  {review.content}
                </p>
              </div>
            ))}
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
