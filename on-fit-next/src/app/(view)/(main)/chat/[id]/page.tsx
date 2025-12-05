import ChatInput from "@/app/(view)/(main)/chat/components/ChatInput";
import RoomInfo from "@/app/(view)/(main)/chat/components/RoomInfo";
import ChatConversation from "@/app/(view)/(main)/chat/components/ChatConversation";

export default async function Page ({params}: {params: Promise<{id : string}>}) {
  const {id} = await params

  return (
    <main className="flex flex-col h-screen">
      {/* 채팅 방 정보 컴포넌트 */}
      <RoomInfo roomId={id}/>
      {/* 대화 내용 컴포넌트 */}
      <ChatConversation roomId={id}/>
      {/* 채팅 입력 컴포넌트 */}
      <ChatInput roomId={id}/>
    </main>
  )
}