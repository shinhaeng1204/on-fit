// app/(main)/reviews/components/ReviewCard.tsx
import { Card, CardHeader } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { Flag, ThumbsUp } from "lucide-react";
import Image from "next/image";

type ReviewMember = {
  userId: string;
  nickname: string;
  profileImage: string | null;
  role: string;
};

interface ReviewCardProps {
  member: ReviewMember;
  onPraise: (member: ReviewMember) => void;
  completed: boolean;
}

export default function ReviewCard({ member, onPraise, completed  }: ReviewCardProps) {
  const { nickname, profileImage } = member;
  const initial = nickname.charAt(0);

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row justify-between gap-4 flex-wrap">
        <div className="flex flex-row items-center gap-4">
          {profileImage ? (
            <Image
              src={profileImage}
              alt={nickname}
              width={50}
              height={50}
              className="rounded-full object-cover"
            />
          ) : (
            <div className="flex h-[50px] w-[50px] items-center justify-center rounded-full bg-gradient-to-br from-lime-400 to-emerald-400 text-black font-bold text-lg">
              {initial}
            </div>
          )}
          <h3 className="font-bold whitespace-nowrap">{nickname}</h3>
        </div>

        <div className="flex flex-row items-center gap-4 flex-wrap">
          {!completed && (
            <Button
              leftIcon={<ThumbsUp size={16} />}
              size="sm"
              onClick={() => onPraise(member)}
            >
              칭찬하기
            </Button>
          )}
          <Flag size={16} />
        </div>
      </CardHeader>
    </Card>
  );
}
