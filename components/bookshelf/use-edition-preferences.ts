'use client'

import { useEffect, useState } from 'react'
import type { Book } from '@/lib/metadata'

const storageKey = 'reader-edition-preferences'
export function useEditionPreferences() {
  const [choices, setChoices] = useState<Record<string, string>>({})
  const [ready, setReady] = useState(false)
  useEffect(() => {
    try {
      const value = JSON.parse(localStorage.getItem(storageKey) || '{}')
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        setChoices(Object.fromEntries(Object.entries(value).filter(([, id]) => typeof id === 'string')) as Record<string, string>)
      }
    } catch { /* Saving preferences is optional. */ }
    setReady(true)
  }, [])
  const select = (book: Book, locale: string) => {
    setChoices((previous) => {
      const next = { ...previous, [`${locale}:${book.workId}`]: book.id }
      try { localStorage.setItem(storageKey, JSON.stringify(next)) } catch { /* Optional preference. */ }
      return next
    })
  }
  return { choices, select, ready }
}
