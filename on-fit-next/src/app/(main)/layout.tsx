import BottomNav from "@/components/common/BottomNav";
import { ReactNode } from "react";

export default function HomeLayout({children}: {children: ReactNode}) {
    return(
        <>
        <div>{children}</div>
        <BottomNav/>
        </>
        
    )
}