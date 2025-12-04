//layout.tsx
import { createSupabaseServerClient } from "@/lib/route-helpers";
import './globals.css'
import { NotificationProvider } from "@/components/common/NotificationProvider";


export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko">
      <body>
        <NotificationProvider>
          {children}
        </NotificationProvider>
      </body>
    </html>
  )
}
