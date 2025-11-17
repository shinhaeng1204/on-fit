'use client'
import {Flag, X} from "lucide-react";
import {Button} from "@/components/common/Button";
import {Radio} from "@/components/common/Radio";
import {TextArea} from "@/components/common/TextArea";
import {api} from "@/lib/axios";
import {useState} from "react";

interface ReportModalProps {
  isOpen : boolean
  onClose : () => void
  postId : string
  targetUserId : string
  postTitle? : string
}

export default function ReportModal ({
   isOpen,
   onClose,
   postId,
   postTitle,
   targetUserId
  } : ReportModalProps) {
  const [loading, setLoading] = useState<Boolean>(false);
  const [error, setError] = useState<string | null>(null)
  const [reason, setReason] = useState('')
  const [details, setDetails] = useState("")

  async function submitReport() {
    if(!reason) {
      setError("신고 사유를 선택해주세요.")
      return
    }

    try{
      setLoading(true)
      setError(null)

      await api.post('/api/posts/report', {
        postId,
        targetUserId,
        reason,
        details,
      }, {
        withCredentials: true as boolean,
      });

      alert("신고가 접수 되었습니다.")
      setReason('')
      setDetails('')
      onClose()
    } catch (e: any) {
      const msg =
        e?.response?.data?.error ??
        e?.response?.data?.message ??
        e.message ??
        "알 수 없는 오류";
      setError(msg);
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* 오버레이 */}
      <div
        className={`
          fixed inset-0 z-40 bg-black/80 
          transition-opacity duration-200
          ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
        `}
        onClick={onClose}
      />

      {/* 모달 박스 */}
      <div
        className={`
          fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg 
          translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 
          shadow-lg sm:rounded-lg sm:max-w-md transition-opacity duration-200
          ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
        `}
      >
        {/* 모달 헤더 */}
        <div className="flex flex-col space-y-1.5 text-center sm:text-left">
          <h2 className="text-lg font-semibold leading-none tracking-tight flex items-center gap-2">
            <Flag className="h-5 w-5 text-destructive" />
            신고하기
          </h2>
          <p className="text-sm text-muted-foreground">
            게시글 '{postTitle}'을(를) 신고합니다.
          </p>
        </div>

        {/* 모달 내용 */}
        <div className="space-y-4 py-4">
          <div className="space-y-3">
            <p className="text-sm font-medium leading-none">신고 사유 *</p>
            <div className="grid gap-2">
              {[
                "스팸 또는 광고",
                "부적절한 내용",
                "허위정보",
                "상업적 이용",
                "욕설 또는 괴롭힘",
                "기타",
              ].map((r, i) => (
                <Radio
                  key={i}
                  name="report"
                  text={r}
                  id={`reason-${i}`}
                  checked={reason === r}
                  onChange={() => setReason(r)}
                />
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium leading-none">상세 내용 (선택)</p>
            <TextArea
              className="mt-1"
              placeholder="신고 사유에 대해 자세히 설명해주세요..."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
            />
          </div>

          {/* 오류 메시지 */}
          {error && <div className="text-red-500 text-sm">{String(error)}</div>}
        </div>

        {/* 모달 푸터 */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            fullWidth
            disabled={loading}
            className="cursor-pointer"
          >
            취소
          </Button>

          <Button
            variant="destructive"
            fullWidth
            onClick={submitReport}
            disabled={loading}
            className="cursor-pointer"
          >
            {loading ? "신고 중..." : "신고하기"}
          </Button>
        </div>

        {/* 닫기 버튼 */}
        <Button
          variant="inherit"
          size="inherit"
          className="absolute right-4 top-4 rounded-sm opacity-70
            hover:opacity-100 focus:outline-none cursor-pointer"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </>
  )
}
