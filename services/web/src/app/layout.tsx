import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'FocusFlow',
    template: '%s | FocusFlow',
  },
  description: 'Focus and productivity management platform',
  keywords: ['productivity', 'focus', 'time management', 'workflow'],
  authors: [{ name: 'FocusFlow Team' }],
  creator: 'FocusFlow',
  publisher: 'FocusFlow',
  metadataBase: new URL('https://focusflow.app'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://focusflow.app',
    siteName: 'FocusFlow',
    title: 'FocusFlow - Focus and Productivity Platform',
    description: 'Focus and productivity management platform',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'FocusFlow',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FocusFlow - Focus and Productivity Platform',
    description: 'Focus and productivity management platform',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'google-site-verification-code',
  },
}

interface RootLayoutProps {
  readonly children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>{children}</body>
    </html>
  )
}