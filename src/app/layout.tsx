import type { Metadata, Viewport } from 'next'
import { Inter, Merriweather, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/toaster'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

const merriweather = Merriweather({
  subsets: ['latin'],
  weight: ['300', '400', '700', '900'],
  variable: '--font-serif',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'SIGNAL — Personal Intelligence Platform',
  description:
    'Transform daily news consumption into active understanding, critical thinking, prediction, and long-term knowledge retention.',
  keywords: [
    'news',
    'intelligence',
    'analysis',
    'prediction',
    'learning',
    'spaced repetition',
    'critical thinking',
  ],
  authors: [{ name: 'SIGNAL' }],
  creator: 'SIGNAL',
  publisher: 'SIGNAL',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'en_GB',
    url: 'https://signal.app',
    siteName: 'SIGNAL',
    title: 'SIGNAL — Personal Intelligence Platform',
    description:
      'Transform daily news consumption into active understanding, critical thinking, prediction, and long-term knowledge retention.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SIGNAL — Personal Intelligence Platform',
    description:
      'Transform daily news consumption into active understanding, critical thinking, prediction, and long-term knowledge retention.',
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en-GB" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${inter.variable} ${merriweather.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}