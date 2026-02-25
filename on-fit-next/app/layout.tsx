// //layout.tsx;
// import './globals.css'
// import { NotificationProvider } from "@/components/provider/NotificationProvider";
// import Providers from "@/components/provider/Provider";
// import Script from 'next/script';

// export default async function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode
// }>) {

//   return (
//     <html lang="ko">
//       <body>
//       <Providers>
//         <NotificationProvider>
//           {children}
          
//         </NotificationProvider>
//       </Providers>
//       <Script
//           src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY}&libraries=services&autoload=false`}
//           strategy="beforeInteractive"
//         />
//       </body>
//     </html>
//   )
// }
import './globals.css'
import { NotificationProvider } from "@/components/provider/NotificationProvider";
import Providers from "@/components/provider/Provider";
import Script from 'next/script';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <head>
        <Script
          src={`https://dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY}&libraries=services&autoload=false`}
          strategy="beforeInteractive"
        />
      </head>
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