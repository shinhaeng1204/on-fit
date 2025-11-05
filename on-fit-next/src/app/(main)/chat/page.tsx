'use client'

import {useEffect, useState} from "react";
import {createClient} from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Message {
  id : string
  nickname : string
  content : string
  created_at : string
}

export default function Page () {
  const [messages, setMessages] = useState<Message[]>([])
  const [nickname, setNickname] = useState("")
  const [input, setInput] = useState('')

  useEffect(() => {
    const loadMessage = async () => {
      const {data} = await supabase.from('message').select('*').order('created_at', {ascending: true})
      setMessages(data || [])
    }

    loadMessage()

    // 실시간 구독
    const channel = supabase
      .channel('public:messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'message' }, payload => {
        setMessages(prev => [...prev, payload.new as Message])
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const sendMessage = async () => {
    if (!nickname.trim() || !input.trim()) return
    await supabase.from('message').insert({ content: input })
    setInput('')
  }

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-xl font-bold mb-2">💬 Supabase Chat Test</h1>

      <input
        className="border rounded px-2 py-1 w-full mb-2"
        placeholder="닉네임 입력"
        value={nickname}
        onChange={e => setNickname(e.target.value)}
      />

      <div className="border rounded h-96 overflow-y-auto p-2 mb-2">
        {messages.map(msg => (
          <div key={msg.id} className="mb-1">
            <b>{msg.nickname}</b>: {msg.content}
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          className="border flex-1 rounded px-2 py-1"
          placeholder="메시지를 입력하세요"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
        />
        <button onClick={sendMessage} className="bg-blue-500 text-white px-3 rounded">
          전송
        </button>
      </div>
    </div>
  )
}