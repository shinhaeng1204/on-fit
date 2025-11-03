import {BadgeProps} from "@/types/post";

const BadgeStyles = {
  bronze : 'bg-gradient-to-r from-amber-700 to-amber-500 text-white',
  silver : 'bg-gradient-to-r from-slate-400 to-slate-200 text-slate-900',
  gold : 'bg-gradient-to-r from-yellow-500 to-yellow-300 text-yellow-900',
  platinum : 'bg-gradient-to-r from-cyan-400 to-blue-400 text-white'
}

const BadgeText = {
  bronze : '브론즈',
  silver : '실버',
  gold : '골드',
  platinum: '플레티넘',
}

export default function Badge ({type, className = ''} : BadgeProps) {
  const colorClass = BadgeStyles[type];
  const displayText = BadgeText[type]

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-all
      duration-300 border-transparent ${colorClass} ${className}`}
    >
      {displayText}
    </span>
  )
}