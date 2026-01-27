import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Providers } from '@/components/Providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'YumSpot | Viral Recipes You Can Actually Cook',
  description: 'YumSpot helps you cook viral recipes at home with step-by-step instructions, smart shopping lists, and meal planning tools.',
  icons: {
    icon: '/favicon.svg',
  },
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
      <head>
        {/* Pinterest Domain Verification - Add your code after claiming */}
        {process.env.NEXT_PUBLIC_PINTEREST_VERIFICATION && (
          <meta name="p:domain_verify" content={process.env.NEXT_PUBLIC_PINTEREST_VERIFICATION} />
        )}
        {/* Google AdSense Verification - Required for site verification */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7017941957735249"
          crossOrigin="anonymous"
        />
      </head>
      <body className={inter.className}>
        <Providers>
          <Header />
          <main className="min-h-screen">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  )
}
