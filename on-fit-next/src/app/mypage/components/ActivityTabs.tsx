import type { ReactNode } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/common/Tabs';
import { CardHeader, CardTitle, CardContent } from '@/components/common/Card';
import StatusPill from '@/app/mypage/components/StatusPill';
import { cn } from '@/lib/utils';

type ActivityItem = {
  id: string;
  title: string;
  date: string;
  status: 'open' | 'close';
};

type ActivityTabsProps = {
  defaultTab?: string;
  tabs: { key: string; label: ReactNode; items: ActivityItem[] }[];
  className?: string;
};

export default function ActivityTabs({
  defaultTab = 'participated',
  tabs,
  className,
}: ActivityTabsProps) {
  return (
    <>
      <CardHeader>
        <CardTitle>활동 내역</CardTitle>
      </CardHeader>

      <CardContent className={cn('pb-5', className)}>
        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            {tabs.map((t) => (
              <TabsTrigger key={t.key} value={t.key}>
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {tabs.map((t) => (
            <TabsContent key={t.key} value={t.key} className="mt-4">
              {t.items.length === 0 ? (
                <div className="flex min-h-[80px] items-center justify-center rounded-lg border border-dashed border-border bg-muted/40 px-3 py-6">
                  <p className="text-sm text-muted-foreground">
                    {t.key === 'participated'
                      ? '참여한 모임이 없습니다.'
                      : t.key === 'created'
                      ? '만든 모임이 없습니다.'
                      : '활동 내역이 없습니다.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {t.items.map((a) => (
                    <div
                      key={a.id}
                      className="flex items-center justify-between rounded-lg bg-secondary/30 p-3"
                    >
                      <div>
                        <p className="font-medium">{a.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(a.date)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusPill status={a.status} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </>
  );
}

function formatDate(raw: string) {
  const dateOnly = raw.split('T')[0]; // 'YYYY-MM-DD'
  const [y, m, d] = dateOnly.split('-');
  return `${y}.${m}.${d}`;
}
