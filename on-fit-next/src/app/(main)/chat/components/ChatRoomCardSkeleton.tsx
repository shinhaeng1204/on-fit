import Skeleton from "@/components/common/Skeleton";
import { Card, CardHeader, CardContent } from "@/components/common/Card";

export default function ChatRoomCardSkeleton() {
  return (
    <Card className="w-[70vw] md:w-[60vw] lg:w-[50vw] xl:w-[40vw]">
      <CardHeader className="flex-row gap-3 items-start">
        <div className="relative">
          <Skeleton className="w-14 h-14 rounded-full" />
        </div>

        <div className="flex-1">
          <Skeleton className="h-4 w-40 mb-2" />
          <Skeleton className="h-4 w-20 mb-3" />
          <Skeleton className="h-3 w-full mb-2" />
          <Skeleton className="h-4 w-24" />
        </div>
      </CardHeader>

      <CardContent>
        <div className="mt-3 flex justify-end gap-2">
          <Skeleton className="h-8 w-full rounded-md" />
          <Skeleton className="h-8 w-full rounded-md" />
        </div>
      </CardContent>
    </Card>
  );
}
