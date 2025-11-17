'use client'

import { sbClient } from "@/lib/supabase-client"
import { Button } from "../common/Button"

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? (typeof window !== 'undefined' ? window.location.origin: "")

export function KakaoLoginButton(){
    const onClick = async () =>{
        const {error} = await sbClient.auth.signInWithOAuth({
            provider:'kakao',
            options:{
                redirectTo:`${BASE_URL}/auth/confirm`,
            }
        })
        if(error) console.error('[kakao oauth]', error)
    }

    return (
        <Button type ='button' className="w-full" variant="outline" onClick={onClick}>
            카카오 계정으로 로그인
        </Button>
    )
}

export function GoogleLoginButton(){
    const onClick = async () =>{
        const {error} = await sbClient.auth.signInWithOAuth({
            provider:'google',
            options:{
                redirectTo:`${BASE_URL}/auth/confirm`,
        }
        })
        if(error) console.error('[google oauth]', error)
    }

    return (
        <Button type="button" className="w-full" variant="outline" onClick={onClick}>
            구글 계정으로 로그인
        </Button>
    )
}