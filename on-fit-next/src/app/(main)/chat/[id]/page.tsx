import ChatInput from "@/components/chat/ChatInput";
import RoomInfo from "@/components/chat/RoomInfo";
import ChatConversation from "@/components/chat/ChatConversation";

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