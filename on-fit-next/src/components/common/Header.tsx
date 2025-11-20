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

  return (
    <header className={`top-0 sticky z-50 glass-card ${className}`}>
      <div
        className={`mx-auto  px-10  py-4 w-full flex items-center justify-between ${containerClassName}`}
      >
        {/* 왼쪽 영역 */}
        {variant === 'back' ? (
          <button
            onClick={() => (onBack ? onBack() : router.back())}
            className={"inline-flex items-center justify-center whitespace-nowrap text-sm font-medium " +
              "ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 " +
              "focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 " +
              "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 " +
              "hover:bg-accent hover:text-accent-foreground h-9 rounded-md px-3 gap-2 cursor-pointer"}
            aria-label="뒤로가기">
            <ArrowLeft className="size-5 shrink-0" />
            {title}
          </button>
        ) : (
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {left}
            {/* main일 때: 왼쪽 정렬 */}
            {title && (
              <h1
                className={cn(`truncate text-lg font-semibold ${titleClassName}`)}
              >
                {title}
              </h1>
            )}
          </div>
        )}

        {/* 오른쪽 영역 */}
        <div className="flex items-center gap-2 shrink-0">{right}</div>
      </div>

      {children && (
        <div className="mx-auto max-w-4xl px-4 sm:px-6">{children}</div>
      )}
    </header>
  )
}
