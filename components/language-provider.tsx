'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { localeCookie, resolveLocale, translate, type Locale, type MessageKey } from '@/lib/i18n'

type LanguageContextValue = {
  locale: Locale
  setLocale: (locale: string) => void
  t: (key: MessageKey, values?: Record<string, string | number>) => string
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

export function LanguageProvider({ initialLocale, children }: {
  initialLocale: Locale
  children: React.ReactNode
}) {
  const [locale, setLanguage] = useState(initialLocale)
  const router = useRouter()

  useEffect(() => {
    document.documentElement.lang = locale
    document.title = translate(locale, 'siteTitle')
  }, [locale])

  const setLocale = (value: string) => {
    const next = resolveLocale(value)
    document.cookie = `${localeCookie}=${next}; Path=/; Max-Age=31536000; SameSite=Lax`
    setLanguage(next)
    // Refresh server-rendered metadata while retaining the current book and scroll position.
    router.refresh()
  }

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t: (key, values) => translate(locale, key, values) }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) throw new Error('LanguageProvider is missing')
  return context
}
