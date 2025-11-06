'use client'
import { useEffect } from 'react'
import { mutate } from 'swr'
export default function AfterAuthRefetchOnce() {
  useEffect(() => { mutate('/api/auth/me') }, [])
  return null
}
