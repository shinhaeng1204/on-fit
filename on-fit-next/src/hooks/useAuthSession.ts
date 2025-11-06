'use client'

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import type { Session } from "@supabase/supabase-js"

export function useAuthSession(){
    const [session, setSession] = useState<Session | null>(null)
    const [ready, setReady] = useState(false)

    useEffect(()=>{
        supabase.auth.getSession().then(({data})=>{
            setSession(data.session ?? null)
            setReady(true)
        })
        const {data:sub} = supabase.auth.onAuthStateChange((_e, s)=>{
            setSession(s)
            setReady(true)
        })
        return ()=>sub.subscription.unsubscribe()
    },[])

    return {session, ready}
}