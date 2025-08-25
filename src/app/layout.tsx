import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Galáxia das Profissões',
  description: 'Explore o universo das profissões e descubra sua vocação através de uma experiência interativa única. Teste vocacional, gamificação e jornadas guiadas.',
  keywords: ['profissões', 'carreiras', 'orientação profissional', 'teste vocacional', 'educação', 'gamificação'],
  authors: [{ name: 'Galáxia das Profissões' }],
  creator: 'Galáxia das Profissões',
  publisher: 'Galáxia das Profissões',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('http://localhost:3000'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: '/',
    title: 'Galáxia das Profissões',
    description: 'Explore o universo das profissões e descubra sua vocação através de uma experiência interativa única',
    siteName: 'Galáxia das Profissões',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Galáxia das Profissões',
    description: 'Explore o universo das profissões e descubra sua vocação através de uma experiência interativa única',
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
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32', type: 'image/x-icon' },
      { url: '/favicon.svg', type: 'image/svg+xml' }
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }
    ],
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="theme-color" content="#4f46e5" />
        <meta name="msapplication-TileColor" content="#4f46e5" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Galáxia Pro" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  )
}