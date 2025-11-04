import {Flag, X} from "lucide-react";
import {Button} from "@/components/common/Button";
import {Radio} from "@/components/common/Radio";
import {TextArea} from "@/components/common/TextArea";

interface ReportModalProps {
  isOpen : boolean
  onClose : () => void
}

export default function ReportModal ({isOpen, onClose} : ReportModalProps) {
  return (
    <>
      <div
        className={`${isOpen ? 'visible' : 'invisible'} fixed inset-0 z-50 bg-black/80`}
        onClick={onClose}></div>
      <div
        className={`${isOpen ? 'visible' : 'invisible'} fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg 
        translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg sm:rounded-lg sm:max-w-md`}>
        {/* 모달 헤더 */}
        <div className="flex flex-col space-y-1.5 text-center sm:text-left">
          <h2 className="text-lg font-semibold leading-none tracking-tight flex items-center gap-2"><Flag
            className="h-5 w-5 text-destructive"/>신고하기</h2>
          <p className="text-sm text-muted-foreground">게시글 '강남 배드민턴 초급자 모집'을(를) 신고합니다.</p>
        </div>
        {/* 모달 내용 */}
        <div className="space-y-4 py-4">
          <div className="space-y-3">
            <p className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">신고 사유 *</p>
            <div className="grid gap-2">
              <Radio name="report" text="스팸 또는 광고" id="num1"/>
              <Radio name="report" text="부적절한 내용" id="num2"/>
              <Radio name="report" text="허위정보" id="num3"/>
              <Radio name="report" text="상업적 이용" id="num4"/>
              <Radio name="report" text="욕설 또는 괴롭힘" id="num5"/>
              <Radio name="report" text="기타" id="num6"/>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">상세 내용 (선택)</p>
            <TextArea className="mt-1" placeholder="신고 사유에 대해 자세히 설명해주세요..." />
          </div>
        </div>
        {/* 모달 푸터/버튼 */}
        <div className="flex gap-3">
          <Button variant="outline" fullWidth={true}>취소</Button>
          <Button variant="destructive" fullWidth={true}>신고하기</Button>
        </div>
        {/* 모달 닫기 버튼 */}
        <Button
          variant="inherit"
          size="inherit"
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer"
          onClick={onClose}
        >
          <X className="h-4 w-4"/>
        </Button>
      </div>
    </>
  )
}