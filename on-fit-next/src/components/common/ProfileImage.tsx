import Image from "next/image"; // 🔥 필수 import
import { cn } from "@/lib/utils";

interface ProfileImageProps {
  containerClassName?: string;
  src?: string;
  alt?: string;
  imageClassName?: string;
  profileName?: string;
  fakeProfileClassName?: string;
  onClick?: () => void;
}

export default function ProfileImage({
  containerClassName,
  src,
  imageClassName,
  profileName,
  fakeProfileClassName,
  onClick,
  alt,
}: ProfileImageProps) {
  
  const firstName = profileName?.slice(0, 1) ?? "?";

  return (
    <div
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold cursor-pointer transition-all duration-200 hover:bg-primary/30 hover:shadow-[0_0_12px_rgba(34,197,94,0.6)] hover:scale-105",
        containerClassName
      )}
      onClick={onClick} // 정상 작동하도록 수정
    >
      {src ? (
        <Image
          src={src}
          className={cn(imageClassName)} // classname → className
          alt={alt ?? ""} // alt는 string이어야 함
          fill={false} // 필요에 따라 layout props 추가 가능 (원하면 최적화해줄게)
          width={40}
          height={40}
        />
      ) : (
        <span className={cn(fakeProfileClassName)}>{firstName}</span>
      )}
    </div>
  );
}
