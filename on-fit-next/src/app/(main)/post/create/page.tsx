// app/(post)/page.tsx  ← 서버
import NewPostForm from "../components/NewPostForm"

export const metadata = { title: '번개 모임 만들기' }

export default function Page() {
  // 옵션은 서버에서도 그냥 상수로 내려도 OK
  const sportOption = ['배드민턴', '축구', '야구']
  const levelOption = ['브론즈', '실버', '골드']
  return (
    <main className="container mx-auto px-4 py-8 max-w-2xl">
      <NewPostForm sportOption={sportOption} levelOption={levelOption} />
    </main>
  )
}
