import React from "react";
import PostInfo from "@/components/post/PostInfo";
import PostHost from "@/components/post/PostHost";

export default function Page () {
  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <PostInfo />
      <PostHost />
    </main>
  )
}