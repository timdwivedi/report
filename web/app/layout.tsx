import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/components/providers/AuthProvider"
import { ThemeProvider } from "@/components/providers/ThemeProvider"
import { OrgContextProvider } from "@/components/providers/OrgContextProvider"
import { NotificationProvider } from "@/components/providers/NotificationProvider"
import { ToastProvider } from "@/components/providers/ToastProvider"
import { Vitals } from "@/components/system/Vitals"
import LockScreen from "@/components/system/LockScreen"
import XRayGlobal from "@/components/feedback/XRayGlobal"
import { TrackingProvider } from "@/components/providers/TrackingProvider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "BrandOps — Run Your Merch Empire",
  description: "From quote to ship in one platform. BrandOps streamlines promotional merchandise distribution with instant pricing, client portals, and full order lifecycle management.",
  openGraph: {
    title: "BrandOps — Run Your Merch Empire",
    description: "From quote to ship in one platform. BrandOps streamlines promotional merchandise distribution with instant pricing, client portals, and full order lifecycle management.",
    type: "website",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <AuthProvider>
            <OrgContextProvider>
              <NotificationProvider>
                <ToastProvider>
                  <TrackingProvider orgId={process.env.NEXT_PUBLIC_ORG_ID || "demo"} />
                  <LockScreen />
                  <XRayGlobal>
                    {children}
                  </XRayGlobal>
                </ToastProvider>
              </NotificationProvider>
            </OrgContextProvider>
          </AuthProvider>
        </ThemeProvider>
        <Vitals />
      </body>
    </html>
  )
}
