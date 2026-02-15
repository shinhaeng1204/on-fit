import { Card, CardHeader, CardContent } from "@/components/common/Card"
import Skeleton from "@/components/common/Skeleton"

export default function FitCardSkeleton() {
  return (
    <Card className="group">
      <CardHeader className="relative flex-row gap-2">
        <Skeleton className="w-10 h-10 rounded-md" />

        <div className="flex flex-col w-full">
          <Skeleton className="h-5 w-32 mb-2" />
          <Skeleton className="h-4 w-20" />
        </div>

        <Skeleton className="absolute right-5 h-5 w-12 rounded-md" />
      </CardHeader>

      <CardContent className="flex flex-col gap-3">

        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-4 w-28" />

        <Skeleton className="h-[1px] w-full mt-1" />

        <div className="flex justify-between mt-2">
          <Skeleton className="h-6 w-16 rounded-md" />
          <Skeleton className="h-8 w-20 rounded-md" />
        </div>

      </CardContent>
    </Card>
  )
}
