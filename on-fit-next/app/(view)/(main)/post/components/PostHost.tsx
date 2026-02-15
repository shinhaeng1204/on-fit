'use client'

import PostHostClient from "@/app/(view)/(main)/post/components/PostHostClient";
import {useQuery} from "@tanstack/react-query";
import {api} from "@/lib/axios";
import PostHostSkeleton from "@/app/(view)/(main)/post/components/PostHostSkeleton";

export default function PostHost({id} : {id:string}) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["post-host", id],
    queryFn: async () => {
      const res = await api.get(`/api/posts/${id}`);
      if (!res.data.ok) throw new Error("Host 정보를 불러올 수 없습니다.");
      return res.data.item;
    },
  });

  const host = data?.profiles;

  if (isLoading) return (
    <PostHostSkeleton/>
  );
  if (error) return <div>호스트 정보 오류</div>;
  if (!data) return null;

  return (
    <>
      <PostHostClient host={host}/>
    </>
  );
}
