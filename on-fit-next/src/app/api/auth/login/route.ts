import { NextResponse } from "next/server";
import { sbClient } from "@/lib/supabase-client";
import { setAuthCookies } from "../_utils"

export async function POST(req:Request){
    let b: any
    try{
        b = await req.json()
    } catch{
        return NextResponse.json({ok:false, error:'INVALID_JSON'}, {status:400})
    }

    const email = String(b?.email || '')
    const password = String(b?.password || '')
    if(!email || !password){
        return NextResponse.json({ok:false, error:'EMAIL_OR_PASSWORD_MISSING'}, {status:400})
    }

    const {data, error} = await sbClient.auth.signInWithPassword({email, password})
    if(error || !data.session){
        return NextResponse.json({ok:false, error:error?.message}, {status:400})
    }

    const res = NextResponse.json({ok:true, user:data.user})
    setAuthCookies(res, data.session)
    return res
}