import {createSupabaseServerClient} from "@/lib/route-helpers";
import PostHostClient from "@/app/(main)/post/components/PostHostClient";

export default async function PostHost({id} : {id:string}) {
  const supabase = await createSupabaseServerClient();

  const { data: post } = await supabase
    .from('posts')
    .select( `
      *,
        profiles:author_id(
        *
      )
    `)
    .eq('id', id)
    .single()

  if (!post) return null;

  const host = post.profiles;

  return (
    <>
      <PostHostClient host={host}/>
    </>
  );
}
