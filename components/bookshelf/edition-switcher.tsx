'use client'

import { useId } from 'react'
import { useLanguage } from '@/components/language-provider'
import { contentLanguageName } from '@/lib/book-versions'
import type { Book } from '@/lib/metadata'

export function EditionSwitcher({ book, versions, onChange, disabled = false }: { book: Book; versions: Book[]; onChange: (book: Book) => void; disabled?: boolean }) {
  const { locale, t } = useLanguage()
  const id = useId()
  return <div className="mt-3 text-xs">
    <label htmlFor={id} className="block mb-1 text-muted-foreground">{t('edition')}</label>
    <select id={id} value={book.id} disabled={disabled || versions.length < 2}
      aria-label={t('chooseEdition', { title: book.title })}
      className="w-full min-w-0 min-h-11 rounded-md border bg-background px-2 py-2 text-base text-foreground disabled:opacity-70"
      onChange={(event) => {
        const selected = versions.find((version) => version.id === event.target.value)
        if (selected) onChange(selected)
      }}>
      {versions.map((version) => <option key={version.id} value={version.id}>
        {contentLanguageName(version.language, locale)} · {version.format.toUpperCase()}{version.title !== book.title ? ` · ${version.title}` : ''}
      </option>)}
    </select>
  </div>
}
