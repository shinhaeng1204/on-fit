import { NextResponse } from "next/server";
import { sbClient } from "@/lib/supabase-client";

export async function POST(req:Request){
    let b:any
    try {
        b = await req.json()
    } catch{
        return NextResponse.json({ok:false, error:'INVALID_JSON'}, {status:400})
    }

    const email = String(b?.email || '')
    const password = String(b?.password || '')
    const metadata = b?.metadata ?? {}

    if(!email || !password){
        return NextResponse.json({ok:false, error:'EMAIL_OR_PASSWORD_MISSING'}, {status:400})
    }

    const origin = new URL(req.url).origin
    const emailRedirectTo = `${origin}/auth/confirm`

    const {data, error} = await sbClient.auth.signUp({
        email, password, 
        options: {data:metadata, emailRedirectTo}
    })
    if(error) return NextResponse.json({ok:false, error:error.message}, {status:400})

    return NextResponse.json({ok:true, user:data.user})
}