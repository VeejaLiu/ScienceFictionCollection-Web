import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { LanguageProvider } from '@/components/language-provider'
import { getServerLocale } from '@/lib/i18n-server'
import { translate } from '@/lib/i18n'
import './globals.css'

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale()
  const title = translate(locale, 'siteTitle')
  const description = translate(locale, 'description')
  return {
    title: {
      default: title,
      template: `%s | ${title}`,
    },
    description,
    authors: [{ name: 'VeejaLiu' }],
    openGraph: {
      title,
      description,
    },
    icons: {
      icon: [
        {
          url: '/icon-light-32x32.png?v=2',
          type: 'image/png',
          sizes: '32x32',
          media: '(prefers-color-scheme: light)',
        },
        {
          url: '/icon-dark-32x32.png?v=2',
          type: 'image/png',
          sizes: '32x32',
          media: '(prefers-color-scheme: dark)',
        },
        {
          url: '/icon.svg?v=2',
          type: 'image/svg+xml',
        },
      ],
      apple: [{ url: '/apple-icon.png?v=2', sizes: '180x180', type: 'image/png' }],
    },
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const locale = await getServerLocale()
  return (
    <html lang={locale}>
      <body className="font-sans antialiased flex min-h-screen flex-col">
        <LanguageProvider initialLocale={locale}>
          <Header />
          <div className="flex-1 flex flex-col">
            {children}
          </div>
          <Footer />
        </LanguageProvider>
        <Analytics />
      </body>
    </html>
  )
}
