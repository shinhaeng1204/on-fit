//서버에서, 현재 로그인한 사용자가 누구인지 확인하는 API
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(){
    const access = (await cookies()).get('sb-access-token')?.value
    if(!access) return NextResponse.json({ok:true, user:null})

    const {data, error} = await supabase.auth.getUser(access)
    if(error) return NextResponse.json({ok:false, error:error.message}, {status:401})

    return NextResponse.json({ok:true, user:data.user})
}