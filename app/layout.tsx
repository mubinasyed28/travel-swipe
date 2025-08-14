import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { TravelProvider } from "@/context/travel-context"
import { Navigation } from "@/components/navigation"
import { Toaster } from "@/components/ui/toaster" // Import Toaster

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Travel Swipe - Discover Your Next Adventure",
  description: "Swipe through amazing destinations and find your perfect travel spot",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <TravelProvider>
          <div className="flex flex-col min-h-screen bg-gray-50">
            <main className="flex-1 pb-16">{children}</main>
            <Navigation />
          </div>
        </TravelProvider>
        <Toaster /> {/* Add Toaster here */}
      </body>
    </html>
  )
}
