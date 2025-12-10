// app/(main)/reviews/components/ReviewList.tsx
import ReviewCard from "./ReviewCard";

type ReviewMember = {
  userId: string;
  nickname: string;
  profileImage: string | null;
  role: string;
};

interface ReviewListProps {
  members: ReviewMember[];
  onPraise: (member: ReviewMember) => void;
  completed: string[]
}

export default function ReviewList({ members, onPraise, completed }: ReviewListProps) {
  return (
    <div className="flex flex-col gap-4 w-full max-w-2xl mx-auto px-4">
      {members.map((m) => (
        <ReviewCard
          key={m.userId}
          member={m}
          onPraise={onPraise}
          completed={completed.includes(m.userId)}
        />
      ))}
    </div>
  );
}
