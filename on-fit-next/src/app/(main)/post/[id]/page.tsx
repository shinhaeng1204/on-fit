import React from "react";
import PostInfo from "@/app/(main)/post/components/PostInfo";
import PostHost from "@/app/(main)/post/components/PostHost";

export default async function Page ({params}: {params: Promise<{id : string}>}) {
  const {id} = await params
  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <PostInfo id={id}/>
      <PostHost id={id}/>
    </main>
  )
}