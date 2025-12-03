'use client'

import { useState } from "react"
import { cn } from "@/lib/utils"
import { ChevronDown } from "lucide-react"

export interface DropBoxProps {
  name?: string
  value?: string
  defaultValue?: string
  options: string[]
  onChange?: (value: string) => void
  className?: string
  required?: boolean
  disabled?: boolean
  placeholder?: string
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
  placeholder = "선택해주세요",
}: DropBoxProps) {
  const [internalValue, setInternalValue] = useState(defaultValue ?? "")
  const isControlled = value !== undefined
  const selectedValue = isControlled ? value : internalValue

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const next = e.target.value
    setInternalValue(next)
    onChange?.(next)
  }

  return (
    <div className="relative">
      <select
        name={name}
        value={selectedValue}
        onChange={handleChange}
        required={required}
        disabled={disabled}
        className={cn(
          "h-11 w-full rounded-md border border-border bg-background/50 px-3 pr-10 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-ring appearance-none",
          className
        )}
      >
        {(!selectedValue || selectedValue === "") && (
          <option value="" disabled hidden>
            {placeholder}
          </option>
        )}

        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>

      <ChevronDown
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
      />
    </div>
  )
}
