import type { Metadata } from 'next'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { LanguageProvider } from '@/components/language-provider'
import { defaultLocale, translate } from '@/lib/i18n'
import { SITE_URL, withBasePath, absoluteUrl } from '@/lib/site'
import './globals.css'

export function generateMetadata(): Metadata {
  const locale = defaultLocale
  const title = translate(locale, 'siteTitle')
  const description = translate(locale, 'description')
  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: title,
      template: `%s | ${title}`,
    },
    description,
    authors: [{ name: 'VeejaLiu' }],
    openGraph: {
      title,
      description,
      type: 'website',
      siteName: title,
      url: absoluteUrl('/'),
    },
    icons: {
      icon: [
        {
          url: withBasePath('/icon-light-32x32.png?v=2'),
          type: 'image/png',
          sizes: '32x32',
          media: '(prefers-color-scheme: light)',
        },
        {
          url: withBasePath('/icon-dark-32x32.png?v=2'),
          type: 'image/png',
          sizes: '32x32',
          media: '(prefers-color-scheme: dark)',
        },
        {
          url: withBasePath('/icon.svg?v=2'),
          type: 'image/svg+xml',
        },
      ],
      apple: [{ url: withBasePath('/apple-icon.png?v=2'), sizes: '180x180', type: 'image/png' }],
    },
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const locale = defaultLocale
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
      </body>
    </html>
  )
}
