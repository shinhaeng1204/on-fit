'use client'
import { Card, CardHeader } from "@/components/common/Card";
import Image from "next/image";
import StatusBadge from "@/components/main/StatusBadge";
import { useRouter } from "next/navigation";

type ChatRoomCardProps = {
    title: string,
    member: number,
    time: string,
    chatting: string,
    tag: string
    roomId: string
}


export default function ChatRoomCard({roomId, title, member, time, chatting, tag}: ChatRoomCardProps) {

    const router = useRouter();

const handleChatRoomCard = () => {
    router.push(`/chat/${roomId}`)
}

    return(
        <Card className="m-4 relative" onClick={handleChatRoomCard}>
            <CardHeader className="flex-row gap-3 items-start">
                <Image
          src="/onfit.png"
          width={40}
          height={40}
          alt="profile"
          
        />
                <div className="gap-2">
                    <div className="flex flex-row gap-2">
                        <h3 className="font-semibold text-ellipsis  md:w-full whitespace-nowrap overflow-hidden">{title}</h3>
                        <StatusBadge variant="outline" >{member}</StatusBadge>
                        <span className="text-xs absolute right-3">{time}</span>
                    </div>
                <h3 className="text-xs mb-2 mt-2">{chatting}</h3>
                <StatusBadge variant="outline">{tag}</StatusBadge>
                </div>
                
                
            </CardHeader>
            
        </Card>
    )
}