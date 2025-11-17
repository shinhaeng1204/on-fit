import {cn} from "@/lib/utils";

interface ProfileImageProps {
  containerClassName? : string,
  src? : string,
  alt? : string,
  imageClassName?: string,
  profileName? : string,
  fakeProfileClassName?: string,
  onClick? : () => void,
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
  
  const firstName = profileName?.slice(0, 1);
  
  return (
    <div className={cn(` 
          flex h-10 w-10 items-center justify-center rounded-full
          bg-primary/15 text-sm font-semibold
          cursor-pointer
          transition-all duration-200
          hover:bg-primary/30
          hover:shadow-[0_0_12px_rgba(34,197,94,0.6)]
          hover:scale-105 ${containerClassName}`)}
        onClick={() => onClick}
    >
      {src? (<>
        <Image src={src} classname={cn(`${imageClassName}`)} alt={alt}></Image>
      </>) : (<>
          <span className={cn(`${fakeProfileClassName}`)}>{firstName}</span>
      </>)}
    </div>
  )
}