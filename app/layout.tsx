import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Viral Recipes You Can Actually Cook',
  description: 'Discover viral recipes that are easy to make at home. Step-by-step instructions, meal plans, and more.',
  other: {
    // Add your Pinterest verification code here after claiming your site
    // Get this from: https://pinterest.com/settings/claim
    // 'p:domain_verify': 'your-verification-code-here',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
