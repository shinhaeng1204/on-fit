import { RecruitStatusProps } from "@/types/post";

const StatusStyles: Record<string, string> = {
  모집중: "bg-success text-success-foreground",
  마감: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
};

export default function RecruitStatus({
  type,
  text,
  className = "",
}: RecruitStatusProps) {
  const colorClass =
    StatusStyles[type] ??
    "bg-secondary text-secondary-foreground hover:bg-secondary/80";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold 
      transition-all duration-300 border-transparent ${colorClass} ${className}`}
    >
      {text}
    </span>
  );
}
