import ChatInput from "@/components/chat/ChatInput";
import RoomInfo from "@/components/chat/RoomInfo";
import ChatConversation from "@/components/chat/ChatConversation";

export default function Page () {

  return (
    <main className="flex flex-col h-screen">
      {/* 채팅 방 정보 컴포넌트 */}
      <RoomInfo />
      {/* 대화 내용 컴포넌트 */}
      <ChatConversation />
      {/* 채팅 입력 컴포넌트 */}
      <ChatInput />
    </main>
  )
}