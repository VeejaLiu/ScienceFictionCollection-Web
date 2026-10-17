'use client'

import { useId } from 'react'
import { useLanguage } from '@/components/language-provider'
import type { Book } from '@/lib/metadata'

export function EditionSwitcher({ book, versions, onChange }: { book: Book; versions: Book[]; onChange: (book: Book) => void }) {
  const { locale, t } = useLanguage()
  const id = useId()
  const languages = new Intl.DisplayNames([locale], { type: 'language' })
  return <div className="mt-3 text-xs">
    <label htmlFor={id} className="block mb-1 text-muted-foreground">{t('edition')}</label>
    <select id={id} value={book.id} disabled={versions.length < 2}
      aria-label={t('chooseEdition', { title: book.title })}
      className="w-full min-w-0 rounded-md border bg-background px-2 py-2 text-foreground disabled:opacity-70"
      onChange={(event) => {
        const selected = versions.find((version) => version.id === event.target.value)
        if (selected) onChange(selected)
      }}>
      {versions.map((version) => <option key={version.id} value={version.id}>
        {languages.of(version.language) || version.language} · {version.format.toUpperCase()}{version.title !== book.title ? ` · ${version.title}` : ''}
      </option>)}
    </select>
  </div>
}
