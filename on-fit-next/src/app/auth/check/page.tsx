'use client'

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { sbClient } from "@/lib/supabase-client"

export default function AuthCheckPage(){
    const router = useRouter()

    useEffect(()=>{
        const checkProfile = async ()=>{
            const {data:{user}} = await sbClient.auth.getUser()

            if(!user){
                router.replace("/login")
                return
            }

            const {data:profile, error} = await sbClient
                .from("profiles")
                .select("*")
                .eq("id", user.id)
                .single()

            if(error && error.code !== "PGRST116"){
                console.error("프로필 조회 오류: ", error)
                router.replace("/login")
                return
            }

            if(!profile?.nickname || !profile?.location){
                router.replace("/profile-setup")
            } else{
                router.replace("/")
            }
        }

        checkProfile()
    }, [router])

    return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-muted-foreground text-sm">프로필 정보를 확인 중...</p>
    </div>
  )
}