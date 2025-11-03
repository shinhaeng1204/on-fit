'use client'

import { ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

interface HeaderProps {
  variant?: 'main' | 'back'
  title?: ReactNode
  left?: ReactNode
  right?: ReactNode
  onBack?: () => void
  className?: string
  containerClassName?: string
  children?: ReactNode
  titleClassName?: string
}

export default function Header({
  variant = 'main',
  title,
  left,
  right,
  onBack,
  className = '',
  containerClassName = '',
  children,
  titleClassName = '',
}: HeaderProps) {
  const router = useRouter()

  const leftArea =
    variant === 'back' ? (
      <button
        onClick={() => (onBack ? onBack() : router.back())}
        className="inline-flex items-center gap-2 rounded-md px-2 py-1 hover:bg-muted focus:outline-none focus:ring-2"
        aria-label="뒤로가기"
      >
        <ArrowLeft className="size-5 shrink-0" />
      </button>
    ) : (
      left
    )

  return (
    <header className={`z-50 glass-card ${className}`}>
      <div
        className={`relative mx-auto  px-10  py-4 w-full flex items-center justify-between ${containerClassName}`}
      >
        {/* 왼쪽 영역 */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {leftArea}

          {/* back일 때: 버튼 옆에 타이틀 */}
          {title && variant === 'back' && (
            <h1 className={`truncate text-lg font-semibold ${titleClassName}`}>
              {title}
            </h1>
          )}

          {/* main일 때: 왼쪽 정렬 */}
          {title && variant !== 'back' && (
            <h1
              className={cn(`truncate text-lg font-semibold ${titleClassName}`)}
            >
              {title}
            </h1>
          )}
        </div>

        {/* 오른쪽 영역 */}
        <div className="flex items-center gap-2 shrink-0">{right}</div>
      </div>

      {children && (
        <div className="mx-auto max-w-4xl px-4 sm:px-6">{children}</div>
      )}
    </header>
  )
}
