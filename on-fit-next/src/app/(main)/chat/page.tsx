
import { createSupabaseServerClient } from "@/lib/route-helpers";
import ChatRoomList from "./components/ChatRoomList";
import { redirect } from "next/navigation";

export default async function ChatPage() {
    const supabase = await createSupabaseServerClient();
    const {data: {user}} = await supabase.auth.getUser();

    if (!user) {
        redirect('/auth?next=/chat');
    }
    
    return(
        <>
            <ChatRoomList/>
        </>
    )
}