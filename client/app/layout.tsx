import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { Navbar } from '@/components/Navbar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'TripWeaver - AI Travel Planner',
  description: 'Plan your perfect trip with AI-powered itinerary generation, budget management, and seamless booking.',
  keywords: 'travel planner, AI itinerary, budget travel, trip planning, vacation planner',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <Providers>
          <div className="min-h-screen bg-bg">
            <Navbar />
            <main className="pt-20">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  )
}
