import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'TripMoja',
  description: 'Your shared journey is one click away. Intercity ridesharing for Kenya.',
  keywords: 'ridesharing, Kenya, Nanyuki, Nairobi, carpooling, intercity',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'TripMoja',
  },
}

export const viewport: Viewport = {
  themeColor: '#7697F5',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans bg-tm-surface text-tm-ink min-h-screen">
        {children}
      </body>
    </html>
  )
}
