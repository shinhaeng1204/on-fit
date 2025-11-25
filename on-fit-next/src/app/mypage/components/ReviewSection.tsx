import { Star } from 'lucide-react';
import { CardHeader, CardTitle, CardContent } from '@/components/common/Card';
import { Review } from '@/app/mypage/review';
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
          <div className="flex min-h-[80px] items-center justify-center rounded-lg border border-dashed border-border bg-muted/40 px-3 py-6">
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
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            'h-4 w-4',
                            i < review.rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'fill-muted text-muted-foreground/20'
                          )}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-medium">{review.reviewerName}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(review.createdAt)}
                  </span>
                </div>
                <p className="text-sm text-foreground/90">{review.content}</p>
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
