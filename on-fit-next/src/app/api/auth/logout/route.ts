import { NextResponse } from "next/server";
import { sbClient } from "@/lib/supabase-client";
import { clearAuthCookies } from "../_utils";

export async function POST(){
    try{
        await sbClient.auth.signOut()
    } catch(e){

    }
    const res = NextResponse.json({ok:true})
    clearAuthCookies(res)
    return res
}