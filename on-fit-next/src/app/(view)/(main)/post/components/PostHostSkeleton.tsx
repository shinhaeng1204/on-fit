import { Card, CardContent, CardHeader } from "@/components/common/Card";

export default function PostHostSkeleton() {
  return (
    <Card className="animate-pulse">
      <CardHeader>
        <h3 className="font-semibold tracking-tight text-lg">주최자 정보</h3>
      </CardHeader>

      <CardContent>
        <div className="flex items-center justify-between">
          {/* 왼쪽: 프로필 + 텍스트 */}
          <div className="flex items-center gap-3">
            {/* 프로필 이미지 placeholder */}
            <div className="w-12 h-12 rounded-full bg-secondary" />

            <div className="flex flex-col gap-2">
              {/* 닉네임 */}
              <div className="h-4 w-24 bg-secondary rounded" />

              {/* 참여 횟수 / 팔로워 */}
              <div className="h-3 w-32 bg-secondary rounded" />
            </div>
          </div>

          {/* 오른쪽 버튼 placeholder */}
          <div className="h-9 w-24 bg-secondary rounded" />
        </div>
      </CardContent>
    </Card>
  );
}
