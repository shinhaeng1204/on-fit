'use client';

import { clsx } from 'clsx';

export default function StatusPill({
  status, className,
}: { status: 'open' | 'close'; className?: string }) {
  const isOpen = status === 'open';
  const base =
  'inline-flex min-w-56px items-center justify-center rounded-full px-3 py-1 text-sm font-medium border';

  const open = clsx(
    'text-black',
    'bg-[hsl(var(--primary))]',
  );

   // 완료: success 계열 (조금 더 진한 초록)
  const close = clsx(
    'text-black',
    'bg-[hsl(var(--success))]',
  );
    return (
      <span className={clsx(base, isOpen ? open : close, className)}>
        {isOpen ? '모집중' : '완료'}
      </span>
    );
}