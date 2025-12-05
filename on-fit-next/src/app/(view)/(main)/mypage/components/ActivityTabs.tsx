'use client';

import { useState } from 'react';
import type { ReactNode } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/common/Tabs';
import { CardHeader, CardTitle, CardContent } from '@/components/common/Card';
import StatusPill from '@/app/(view)/(main)/mypage/components/StatusPill';
import { cn } from '@/lib/utils';
import { Button } from '@/components/common/Button';
import { Trash2, Pencil } from 'lucide-react';
import {useRouter} from "next/navigation";

export type ActivityItem = {
  id: string;
  title: string;
  date: string;
  status: 'open' | 'close'; // open=진행중, close=완료
};

type ActivityTabsProps = {
  defaultTab?: string;
  tabs: { key: string; label: ReactNode; items: ActivityItem[] }[];
  className?: string;
  onDeleteCreated?: (id: string) => void;
};

type StatusFilter = 'all' | 'open' | 'close';

export default function ActivityTabs({
  defaultTab = 'participated',
  tabs,
  className,
  onDeleteCreated,
}: ActivityTabsProps) {
  const router = useRouter()
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('open'); // 기본값: 진행중

  const renderFilterButton = (value: StatusFilter, label: string) => (
    <button
      type="button"
      onClick={() => setStatusFilter(value)}
      className={cn(
        'rounded-full px-3 py-1 text-xs border transition-colors',
        value === statusFilter
          ? 'bg-primary text-primary-foreground border-primary'
          : 'bg-background/60 text-muted-foreground border-border hover:bg-muted/70'
      )}
    >
      {label}
    </button>
  );

  const applyFilter = (items: ActivityItem[]) => {
    if (statusFilter === 'all') return items;
    if (statusFilter === 'open') return items.filter((i) => i.status === 'open');
    return items.filter((i) => i.status === 'close');
  };

  return (
    <>
      <CardHeader>
        <CardTitle>활동 내역</CardTitle>
      </CardHeader>

      <CardContent className={cn('pb-5', className)}>
        <Tabs defaultValue={defaultTab} className="w-full">
          {/* 상단 탭: 참여한 모임 / 만든 모임 */}
          <TabsList className="grid w-full grid-cols-2">
            {tabs.map((t) => (
              <TabsTrigger key={t.key} value={t.key}>
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* 상태 필터: 전체 / 진행중 / 완료 */}
          <div className="mt-4 mb-3 flex items-center justify-end gap-2">
            {renderFilterButton('all', '전체')}
            {renderFilterButton('open', '진행중')}
            {renderFilterButton('close', '완료')}
          </div>

          {tabs.map((t) => {
            const filteredItems = applyFilter(t.items);

            return (
              <TabsContent key={t.key} value={t.key} className="mt-2">
                {filteredItems.length === 0 ? (
                  <div className="flex min-h-[80px] items-center justify-center rounded-lg border border-dashed border-border bg-muted/40 px-3 py-6">
                    <p className="text-sm text-muted-foreground">
                      {statusFilter === 'open'
                        ? t.key === 'participated'
                          ? '진행중인 참여 모임이 없습니다.'
                          : t.key === 'created'
                          ? '진행중인 만든 모임이 없습니다.'
                          : '진행중인 활동이 없습니다.'
                        : statusFilter === 'close'
                        ? t.key === 'participated'
                          ? '완료된 참여 모임이 없습니다.'
                          : t.key === 'created'
                          ? '완료된 만든 모임이 없습니다.'
                          : '완료된 활동이 없습니다.'
                        : t.key === 'participated'
                        ? '참여한 모임이 없습니다.'
                        : t.key === 'created'
                        ? '만든 모임이 없습니다.'
                        : '활동 내역이 없습니다.'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredItems.map((a) => (
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

                          {t.key === 'created' && a.status !== 'close' && (
                           <Button
                             rightIcon={<Pencil />}
                             type="button"
                             variant="secondary"
                             className="cursor-pointer"
                             onClick={() => router.push(`/post/${a.id}/edit`)}
                           >
                             수정
                           </Button>
                          )}

                          {/* '만든 모임' 탭에서만 삭제 버튼 표시 */}
                          {t.key === 'created' && onDeleteCreated && (
                            <Button
                              rightIcon={<Trash2 />}
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="cursor-pointer"
                              onClick={() => onDeleteCreated(a.id)}
                            >
                              삭제
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            );
          })}
        </Tabs>
      </CardContent>
    </>
  );
}

function formatDate(raw: string) {
  const dateOnly = raw.split('T')[0];
  const [y, m, d] = dateOnly.split('-');
  return `${y}.${m}.${d}`;
}
