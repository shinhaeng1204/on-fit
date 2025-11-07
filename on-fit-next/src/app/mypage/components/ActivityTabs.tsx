'use client';

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/common/Tabs';
import { CardHeader, CardTitle, CardContent } from '@/components/common/Card';
import StatusPill from '@/app/mypage/components/StatusPill';
import { cn } from '@/lib/utils';

type ActivityItem = { id: string; title: string; date: string; status: 'open' | 'close' };

export default function ActivityTabs({
  defaultTab = 'participated',
  tabs,
  className,
}: {
  defaultTab?: string;
  tabs: { key: string; label: React.ReactNode; items: ActivityItem[] }[];
  className?: string;
}) {
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
              <div className="space-y-3">
                {t.items.map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{a.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(a.date)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusPill status={a.status}/>
                      
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </>
  );
}

function formatDate(iso: string) {
  // 간단 표기: YYYY.MM.DD
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, '0');
  const da = `${d.getDate()}`.padStart(2, '0');
  return `${y}.${m}.${da}`;
}
