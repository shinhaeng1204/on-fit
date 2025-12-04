// app/(post)/page.tsx  ← 서버
import NewPostForm from "../components/NewPostForm"

export const metadata = { title: '번개 모임 만들기' }

export default function Page() {
  // 옵션은 서버에서도 그냥 상수로 내려도 OK
  const sportOption = [
    "헬스",
    "PT",
    "크로스핏",
    "파워리프팅",
    "보디빌딩",

    // --- 러닝/걷기 ---
    "런닝",
    "조깅",
    "마라톤",
    "트레일러닝",
    "걷기",

    // --- 공놀이 계열 ---
    "축구",
    "풋살",
    "농구",
    "배구",
    "족구",
    "테니스",
    "배드민턴",
    "탁구",
    "야구",

    // --- 라이딩/야외 ---
    "라이딩",
    "자전거",
    "로드자전거",
    "MTB",
    "등산",
    "하이킹",
    "캠핑",
    "낚시",

    // --- 수상 ---
    "수영",
    "서핑",
    "패들보드",

    // --- 실내/기타 ---
    "필라테스",
    "요가",
    "스트레칭",
    "줌바",
    "방탈출",
    "클라이밍",
    "복싱",
    "킥복싱",
    "주짓수",
    "태권도",

    // --- 취미(운동 겸용 번개에 자주 등장) ---
    "볼링",
    "노래방",
    "보드게임",
    "사진",
    "드라이브",
  ];
  const levelOption = ['브론즈', '실버', '골드']
  return (
    <main className="container mx-auto px-4 py-8 max-w-2xl">
      <NewPostForm sportOption={sportOption} levelOption={levelOption} />
    </main>
  )
}
