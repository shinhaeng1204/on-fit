import {Card, CardContent, CardHeader} from "@/components/common/Card";
import Badge from "@/components/common/Badge";
import {Button} from "@/components/common/Button";
import {UserPlus} from "lucide-react"

const data = {
  name : '운동왕',
  participationCount : 23,
}

export default function PostHost () {
  return (
    <Card>
      <CardHeader>
        <h3 className="font-semibold tracking-tight text-lg">주최자 정보</h3>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* TODO: 프로필 사진 공통 컴포넌트 작업 필요*/}
            <span></span>
            <div>
              <p className="font-semibold">{data.name}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge type="gold" />
                <span className="text-xs text-muted-foreground">참여 {data.participationCount}회</span>
              </div>
            </div>
          </div>
          <Button variant="sport" size="sm" leftIcon={<UserPlus className="mr-2 h-4 w-4" />}>팔로우</Button>
        </div>
      </CardContent>
    </Card>
  )
}