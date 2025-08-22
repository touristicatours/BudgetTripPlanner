import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '../src/components/providers'
import { ErrorBoundary } from '../src/components/ErrorBoundary'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'TripWeaver',
  description: 'Your AI travel agent—plan, price, and book smarter trips.',
  keywords: 'travel, AI, planning, destinations, itinerary, vacation, trip planning',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} gradient-bg antialiased`} suppressHydrationWarning={true}>
        <Providers>
          <ErrorBoundary>
            <div className="min-h-screen">
              {children}
            </div>
          </ErrorBoundary>
        </Providers>
      </body>
    </html>
  )
}
