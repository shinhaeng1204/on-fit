// app/(post)/page.tsx  ← 서버
import NewPostForm from "../components/NewPostForm"
import {sportOption} from "@/constants/sports-option";
import {levelOption} from "@/constants/level-option";

export const metadata = { title: '번개 모임 만들기' }

export default function Page() {

  return (
    <main className="container mx-auto px-4 py-8 max-w-2xl">
      <NewPostForm
        sportOption={sportOption}
        levelOption={levelOption}
        mode="create"
      />
    </main>
  )
}
