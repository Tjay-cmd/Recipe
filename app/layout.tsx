import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Providers } from '@/components/Providers'
import { PinterestTag } from '@/components/PinterestTag'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'YumSpot | Viral Recipes You Can Actually Cook',
  description: 'YumSpot helps you cook viral recipes at home with step-by-step instructions, smart shopping lists, and meal planning tools.',
  icons: {
    icon: '/favicon.svg',
  },
  other: {
    'p:domain_verify': '88e4e9ac45450a5e768b80c267f67708',
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
        {/* Pinterest Domain Verification for yumspot.co.za */}
        <meta name="p:domain_verify" content="88e4e9ac45450a5e768b80c267f67708" />
        {/* Google AdSense Verification - Required for site verification */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7017941957735249"
          crossOrigin="anonymous"
        ></script>
      </head>
      <body className={inter.className}>
        <PinterestTag />
        <Providers>
          <Header />
          <main className="min-h-screen">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  )
}
