import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import DarkModeProvider from '@/components/dark-mode-provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Daily Bread - Personalized Daily Devotionals',
  description: 'Start each day with Scripture personalized for your journey',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} dark:bg-stone-900`}>
        <DarkModeProvider>{children}</DarkModeProvider>
      </body>
    </html>
  )
}
