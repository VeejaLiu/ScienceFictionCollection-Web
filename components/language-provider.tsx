'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { localeCookie, resolveLocale, translate, type Locale, type MessageKey } from '@/lib/i18n'

type LanguageContextValue = {
  locale: Locale
  ready: boolean
  setLocale: (locale: string) => void
  t: (key: MessageKey, values?: Record<string, string | number>) => string
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

export function LanguageProvider({ initialLocale, children }: {
  initialLocale: Locale
  children: React.ReactNode
}) {
  const [locale, setLanguage] = useState(initialLocale)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const saved = document.cookie.split('; ').find((part) => part.startsWith(`${localeCookie}=`))?.split('=')[1]
    if (saved) setLanguage(resolveLocale(saved))
    setReady(true)
  }, [])

  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  const setLocale = (value: string) => {
    const next = resolveLocale(value)
    document.cookie = `${localeCookie}=${next}; Path=/; Max-Age=31536000; SameSite=Lax`
    setLanguage(next)
  }

  return (
    <LanguageContext.Provider value={{ locale, ready, setLocale, t: (key, values) => translate(locale, key, values) }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) throw new Error('LanguageProvider is missing')
  return context
}
