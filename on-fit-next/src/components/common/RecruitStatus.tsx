type StatusVariant = 'open' | 'close'

interface RecruitStatusProps {
  type: StatusVariant,
  text: string,
  className?: string, // 추가 스타일
}

const StatusStyles = {
  open : 'bg-success text-success-foreground',
  close : 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
}

export default function RecruitStatus ({type, text, className = '' } : RecruitStatusProps) {
  const colorClass = StatusStyles[type];

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold 
      transition-all duration-300 border-transparent ${colorClass} ${className}`}
    >
      {text}
    </span>
  )
}