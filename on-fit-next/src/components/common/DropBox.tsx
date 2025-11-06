'use client'
import { useState } from 'react'
import { cn } from '@/lib/utils'

export interface DropBoxProps {
  name?: string
  value?: string                 // controlled value
  defaultValue?: string          // uncontrolled 초기값
  options: string[]
  onChange?: (value: string) => void
  className?: string
  required?: boolean
  disabled?: boolean
}

export default function DropBox({
  name,
  value,
  defaultValue,
  options,
  onChange,
  className,
  required,
  disabled,
}: DropBoxProps) {
  const [internalValue, setInternalValue] = useState(defaultValue ?? '')
  const selectedValue = value ?? internalValue

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const next = e.target.value
    setInternalValue(next)
    onChange?.(next)
  }

  return (
    <select
      name={name}
      value={selectedValue}
      onChange={handleChange}
      required={required}
      disabled={disabled}
      className={cn(
        'h-11 w-full rounded-md border border-border bg-background/50 px-3 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-ring',
        className
      )}
    >
      {/* placeholder (defaultValue가 없으면 안내문구) */}
      {(!defaultValue || defaultValue === '') && (
        <option value="" disabled hidden>선택해주세요</option>
      )}
      {options.map((opt) => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  )
}
