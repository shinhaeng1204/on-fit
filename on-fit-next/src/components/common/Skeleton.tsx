export default function Skeleton({
   className = ""
 }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-gray-300/40 rounded-md ${className}`} />
  );
}