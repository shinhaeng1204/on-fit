import MainLayoutShell from "@/components/layout/MainLayoutShell"
import { createSupabaseServerClient } from "@/lib/route-helpers";

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return <MainLayoutShell user={user}>{children}</MainLayoutShell>
}
