import BottomNav from "@/components/common/BottomNav";
import Header from "@/components/common/Header";
import { Bell, MapPin, Sun } from "lucide-react";
import { ReactNode } from "react";

export default function HomeLayout({children}: {children: ReactNode}) {
    return(
        <>
        <Header
        variant="main"
        title="운동 번개"
        titleClassName= "text-2xl text-gradient-brand font-bold"
        containerClassName="bg-card/80 backdrop-blur-sm border-b border-border"
        right={
            <div className="flex  items-center gap-5">
                <Sun className="w-5 h-5"/>
                <MapPin className="w-5 h-5"/>
                <Bell className="w-5 h-5"/>
            </div>
        }
        >
            

        </Header>
        <div className="">{children}</div>
        <BottomNav/>
       </>
      
        
    )
}