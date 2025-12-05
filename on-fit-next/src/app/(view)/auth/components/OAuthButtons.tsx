'use client'

import { sbClient } from "@/lib/supabase-client"
import { Button } from "../../../../components/common/Button"

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? (typeof window !== 'undefined' ? window.location.origin: "")

export function KakaoLoginButton({ next, className }: { next: string; className?:string}){
    const onClick = async () =>{
        const {error} = await sbClient.auth.signInWithOAuth({
            provider:'kakao',
            options:{
                redirectTo:`${BASE_URL}/auth/confirm#next=${encodeURIComponent(next)}`
            }
        })
        if(error) console.error('[kakao oauth]', error)
    }

    return (
        <Button type ='button' className={className} variant="outline" onClick={onClick}>
            카카오 계정으로 로그인
        </Button>
    )
}

export function GoogleLoginButton({ next, className }: { next: string; className?:string }){
    const onClick = async () =>{
        const {error} = await sbClient.auth.signInWithOAuth({
            provider:'google',
            options:{
                redirectTo:`${BASE_URL}/auth/confirm#next=${encodeURIComponent(next)}`,
        }
        })
        if(error) console.error('[google oauth]', error)
    }

    return (
        <Button type="button" className={className} variant="outline" onClick={onClick}>
            구글 계정으로 로그인
        </Button>
    )
}