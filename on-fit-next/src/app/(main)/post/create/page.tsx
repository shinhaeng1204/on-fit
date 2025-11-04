import {Card, CardContent, CardHeader} from "@/components/common/Card";
import DropBox from "@/components/common/DropBox";
import {Input} from "@/components/common/Input";
import {TextArea} from "@/components/common/TextArea";
import {Button} from "@/components/common/Button";

const sportOption = [
  "배드민턴", "축구", "야구"
]

const levelOption = [
  '브론즈', '실버', '골드'
]

export default function Page () {

  return (
    <main className="container mx-auto px-4 py-8 max-w-2xl">
      <Card>
        <CardHeader className="flex flex-col space-y-1.5 p-6">
          <h3 className="font-semibold tracking-tight text-2xl">번개 모임 만들기</h3>
          <p className="text-sm text-muted-foreground">함께 운동할 사람들을 모집해보세요!</p>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <form action="" className="space-y-6">
            {/* 운동 종목 */}
            <div className="space-y-2 flex flex-col">
              <label
                htmlFor=""
                className="text-sm font-medium leading-none
                peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                운동 종목 *
              </label>
              <DropBox options={sportOption} className="w-full" />
            </div>
            {/* 제목 */}
            <div className="space-y-2 flex flex-col">
              <label
                htmlFor=""
                className="text-sm font-medium leading-none
                peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                제목 *
              </label>
              <Input type="text" placeholder="예: 강남 배드민턴 초급자 모집!" />
            </div>
            {/* 소개 */}
            <div className="space-y-2 flex flex-col">
              <label
                htmlFor=""
                className="text-sm font-medium leading-none
                peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                소개 *
              </label>
              <TextArea placeholder="모임에 대해 간단히 소개해주세요" />
            </div>
            {/* 장소 */}
            <div className="space-y-2 flex flex-col">
              <label
                htmlFor=""
                className="text-sm font-medium leading-none
                peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                장소 *
              </label>
              <Input type="text" placeholder="예: 강남구 역삼동 체육관" />
            </div>
            {/* 날짜 및 시간*/}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2 flex flex-col">
                <label
                  htmlFor=""
                  className="text-sm font-medium leading-none
                peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  날짜 *
                </label>
                <Input type="date" />
              </div>
              <div className="space-y-2 flex flex-col">
                <label
                  htmlFor=""
                  className="text-sm font-medium leading-none
                peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  시간 *
                </label>
                <Input type="time" />
              </div>
            </div>
            {/* 인원 및 기준 */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2 flex flex-col">
                <label
                  htmlFor=""
                  className="text-sm font-medium leading-none
                peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  모집 인원 *
                </label>
                <Input type="number" placeholder="예: 6" />
              </div>
              <div className="space-y-2 flex flex-col">
                <label
                  htmlFor=""
                  className="text-sm font-medium leading-none
                peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  실력 기준 *
                </label>
                <DropBox options={levelOption} />
              </div>
            </div>
            {/* 준비물 */}
            <div className="space-y-2 flex flex-col">
              <label
                htmlFor=""
                className="text-sm font-medium leading-none
                peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                준비물
              </label>
              <Input type="text" placeholder="예: 라켓(대여 가능), 운동화" />
            </div>
            {/* 참가비 */}
            <div className="space-y-2 flex flex-col">
              <label
                htmlFor=""
                className="text-sm font-medium leading-none
                peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                참가비
              </label>
              <Input type="text" placeholder="예: 15,000원 (시설비 포함)" />
            </div>
            {/* 버튼 인터렉션 */}
            <div className="flex gap-3 pt-4">
              <Button variant="outline" fullWidth={true}>취소</Button>
              <Button variant="hero" fullWidth={true}>모임 만들기</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}