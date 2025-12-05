//layout.tsx;
import './globals.css'
import { NotificationProvider } from "@/components/provider/NotificationProvider";
import Providers from "@/components/provider/Provider";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {

  return (
    <html lang="ko">
      <body>
      <Providers>
        <NotificationProvider>
          {children}
        </NotificationProvider>
      </Providers>
      </body>
    </html>
  )
}
