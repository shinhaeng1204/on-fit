"use client"

import { useInfiniteQuery } from "@tanstack/react-query"
import { useEffect, useRef } from "react"
import FitList from "@/components/main/FitList"
import type { postType } from "@/types/post"
import { api } from "@/lib/axios"

async function fetchPosts({ pageParam = 0 }) {
  const res = await api.get(`/api/posts?page=${pageParam}`)
  return res.data
}

export default function FitListInfinite() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
    error,
  } = useInfiniteQuery({
    queryKey: ["posts"],
    queryFn: fetchPosts,
    getNextPageParam: (lastPage) => lastPage?.nextPage ?? null,
    initialPageParam: 0,
  })

  const loaderRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!hasNextPage) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchNextPage()
        }
      },
      { threshold: 1 }
    )

    if (loaderRef.current) observer.observe(loaderRef.current)
    return () => observer.disconnect()
  }, [hasNextPage, fetchNextPage])

  if (status === "pending") return <div>로딩...</div>
  if (status === "error") return <div>에러 발생: {String(error)}</div>

  const items: postType[] =
    data?.pages?.flatMap((page) => page.items) ?? []

  return (
    <>
      <FitList items={items} />

      <div ref={loaderRef} className="h-10" />

      {isFetchingNextPage && (
        <div className="text-center py-3">더 불러오는 중…</div>
      )}
    </>
  )
}
