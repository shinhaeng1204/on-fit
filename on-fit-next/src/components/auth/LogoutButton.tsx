'use client'

import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Button } from "../common/Button"

export default function LogoutButton(){
    const router = useRouter()

    const onLogout = async () =>{
        const {error} = await supabase.auth.signOut()
        if(error){
            console.error('[logout] failed: ', error)
            return
        }
        router.replace('/')
    }
    return (
        <Button type="button" onClick={onLogout} variant="outline" className="w-full">
            로그아웃
        </Button>
    )
}