// src/components/common/Badge.tsx
import { BadgeProps } from "@/types/post";
import { cn } from "@/lib/utils";

const BadgeStyles: Record<string, string> = {
  // 초심자: 진한 초록 계열
  첫걸음:
    "bg-gradient-to-r from-green-600 to-green-400 text-white border-green-500/60",

  초심자:
    "bg-gradient-to-r from-amber-700 to-amber-500 text-white border-amber-300/40",

  활동가:
    "bg-gradient-to-r from-slate-400 to-slate-200 text-slate-900 border-slate-300/40",

  베테랑:
    "bg-gradient-to-r from-yellow-500 to-yellow-300 text-yellow-900 border-yellow-300/40",

  레전드:
    "bg-gradient-to-r from-cyan-400 to-blue-400 text-white border-cyan-200/40",
};

export default function Badge({
  type,
  className = "",
  showLabel = true, // 기본은 텍스트도 같이 보여줌
}: BadgeProps) {
  const colorClass = BadgeStyles[type] || BadgeStyles["초심자"];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold border transition-all duration-300",
        colorClass,
        className
      )}
    >
      {showLabel && <span>{type}</span>}
    </span>
  );
}
