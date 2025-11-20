//layout.tsx
import { createSupabaseServerClient } from "@/lib/route-helpers";
import './globals.css'
import { NotificationProvider } from "@/components/common/NotificationProvider";


export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const supabase = await createSupabaseServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id ?? "";

  return (
    <html lang="ko">
      <body>
        <NotificationProvider userId={userId}>
          {children}
        </NotificationProvider>

      </body>
    </html>
  )
}
