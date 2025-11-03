'use client'
import { getToken } from "@/api"
import { useEffect } from "react"

const client_id = "50f5edb620ccf07aca7fc0d12debbb11"
const redirect_uri = "http://localhost:3000"
const response_type = "code"

export default function KakaoLogin(){
    //카카오로부터 값을 받으면 /code=어쩌고저쩌고 형태로 받음
    useEffect(()=>{
        const search = new URLSearchParams(window.location.search) //?code=어쩌고 부분 가져옴
        const code = search.get("code") //어쩌고 부분 가져옴
        const accessToken = localStorage.getItem('access_token')

        if(code){
            //POST /oauth/token을 날림
            handleGetToken()
        }
    },[])

    const handleGetToken = async ()=>{
        const {
            token_type,
            access_token,
            expires_in,
            refresh_token,
            refrest_token_expires_in,
        } = await getToken()

        localStorage.setItem('access_token', access_token)
    }

    const authParam = new URLSearchParams({
        client_id,
        redirect_uri,
        response_type
    })

    return (
        <a href={`https://kauth.kakao.com/oauth/authorize?${authParam.toString()}`}>로그인</a>
    )
}