import {BadgeProps} from "@/types/post";

const BadgeStyles = {
  브론즈 : 'bg-gradient-to-r from-amber-700 to-amber-500 text-white',
  실버 : 'bg-gradient-to-r from-slate-400 to-slate-200 text-slate-900',
  골드 : 'bg-gradient-to-r from-yellow-500 to-yellow-300 text-yellow-900',
  플레티넘 : 'bg-gradient-to-r from-cyan-400 to-blue-400 text-white'
}

export default function Badge ({type, className = ''} : BadgeProps) {
  const colorClass = BadgeStyles[type];

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-all
      duration-300 border-transparent ${colorClass} ${className}`}
    >
      {type}
    </span>
  )
}