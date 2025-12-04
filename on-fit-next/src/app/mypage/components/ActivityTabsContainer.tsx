'use client';

import { useState } from 'react';
import ActivityTabs, {
ActivityItem,
} from '@/app/mypage/components/ActivityTabs';

type Props = {
  participated: ActivityItem[];
  created: ActivityItem[];
};

export default function ActivityTabsContainer({ participated, created }: Props) {
  // 🔹 “만든 모임”만 상태로 관리 (삭제 시 UI 업데이트)
  const [createdItems, setCreatedItems] = useState(created);

  async function handleDeleteCreated(id: string) {
    const ok = window.confirm('정말 이 모임을 삭제하시겠어요?');
    if (!ok) return;

    const prev = createdItems;
    // optimistic UI: 먼저 UI에서 제거
    setCreatedItems((list) => list.filter((item) => item.id !== id));

    try {
      const res = await fetch(`/api/posts/${id}`, { method: 'DELETE' });

      if (!res.ok) {
        throw new Error('삭제 실패');
      }
      // 성공: 그대로 두면 끝
    } catch (e) {
      // 실패: 롤백
      setCreatedItems(prev);
      alert('삭제 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  }

  const tabs = [
    {
      key: 'participated',
      label: '참여한 모임',
      items: participated,
    },
    {
      key: 'created',
      label: '만든 모임',
      items: createdItems,
    },
  ];

  return (
    <ActivityTabs
      tabs={tabs}
      defaultTab="participated"
      onDeleteCreated={handleDeleteCreated}
    />
  );
}
