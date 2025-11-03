'use client'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface DropBoxProps {
  value?: string               // 현재 선택된 값 (controlled)
  defaultValue?: string        // 기본값 (uncontrolled)
  options: string[]            // 드롭다운에 표시할 항목
  onSelect?: (value: string) => void
  className?: string
}

export default function DropBox({
  value,
  defaultValue,
  options,
  onSelect,
  className,
}: DropBoxProps) {
  const [internalValue, setInternalValue] = useState(defaultValue ?? '')

  // 외부에서 제어값이 들어오면 그걸 우선 사용
  const selectedValue = value ?? internalValue

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = e.target.value
    // 내부 상태 업데이트
    setInternalValue(newValue)
    // 외부 콜백 실행
    onSelect?.(newValue)
  }

  return (
    <select
      className={cn(
        'py-2 px-3 text-sm font-bold rounded-md border border-border bg-background/50 text-foreground focus:outline-none focus:ring-2 focus:shadow-none focus:ring-ring  focus:ring-offset-ring',
        className
      )}
      value={selectedValue}
      onChange={handleChange}
    >
      {/* placeholder option */}
      <option value="" disabled hidden>
        {defaultValue ?? '선택해주세요'}
      </option>

      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  )
}
