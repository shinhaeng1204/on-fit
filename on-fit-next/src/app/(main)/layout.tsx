import BottomNav from "@/components/common/BottomNav";
import Header from "@/components/common/Header";
import AuthControls from "@/components/header/AuthControls";
import { Bell, MapPin, Sun } from "lucide-react";
import { ReactNode } from "react";

export default function HomeLayout({children}: {children: ReactNode}) {
    return(
        <div className="mb-24">
        <Header
        variant="main"
        title="온 핏"
        titleClassName= "text-2xl text-gradient-brand font-bold"
        containerClassName="bg-card/80 backdrop-blur-sm border-b border-border"
        right={
            <div className="flex  items-center gap-5">
                <Sun className="w-5 h-5"/>
                <MapPin className="w-5 h-5"/>
                <Bell className="w-5 h-5"/>
                <AuthControls />
            </div>
        }
        >
            

        </Header>
        <div className="">{children}</div>
        <BottomNav/>
       </div>
      
        
    )
}