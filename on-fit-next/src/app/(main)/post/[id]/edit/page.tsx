import NewPostForm from "@/app/(main)/post/components/NewPostForm";
import {sportOption} from "@/constants/sports-option";
import {levelOption} from "@/constants/level-option";
import {api} from "@/lib/axios";
import {createSupabaseServerClient} from "@/lib/route-helpers";

export default async function Page({params}: {params: Promise<{id : string}>}) {
  const {id} = await params

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("id", id)
    .single();

  return (
    <main className="container mx-auto px-4 py-8 max-w-2xl">
      <NewPostForm
        sportOption={sportOption}
        levelOption={levelOption}
        mode="edit"
        initialData={data}
      />
    </main>
  )
}