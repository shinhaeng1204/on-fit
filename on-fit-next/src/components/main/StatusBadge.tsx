import { cn } from "@/lib/utils"

const variant = {
  default:
    "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
  secondary:
    "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
  destructive:
    "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
  outline: "text-foreground",
  success: "border-transparent bg-success text-success-foreground",
  warning: "border-transparent bg-warning text-warning-foreground",
} as const

type VariantType = keyof typeof variant

interface BadgeProps {
  variant?: VariantType
  className?: string
  children?: React.ReactNode
}

export default function StatusBadge({
  variant: v = "default",
  className,
  children,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold transition-all duration-300",
        variant[v],
        className
      )}
    >
      {children}
    </span>
  )
}
