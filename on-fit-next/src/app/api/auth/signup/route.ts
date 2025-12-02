import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/route-helpers";

export async function POST(req:Request){
    const supabase = await createSupabaseServerClient();
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

    const { data: existing, error: queryError } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", email)
        .maybeSingle();

    if (existing) {
        return NextResponse.json(
        { ok: false, error: "EMAIL_ALREADY_REGISTERED" },
        { status: 400 }
        );
    }

    const origin = new URL(req.url).origin
    const emailRedirectTo = `${origin}/auth/confirm`

    const {data, error} = await supabase.auth.signUp({
        email, password, 
        options: {data:metadata, emailRedirectTo}
    })
    if(error) {
        return NextResponse.json({ok:false, error:error.message}, {status:400})
    }
    return NextResponse.json({ok:true, user:data.user})
}