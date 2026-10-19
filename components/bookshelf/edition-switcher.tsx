'use client'

import { useId } from 'react'
import { ChevronDown } from 'lucide-react'
import { useLanguage } from '@/components/language-provider'
import { contentLanguageName } from '@/lib/book-versions'
import type { Book } from '@/lib/metadata'

export function EditionSwitcher({ book, versions, onChange, disabled = false }: { book: Book; versions: Book[]; onChange: (book: Book) => void; disabled?: boolean }) {
  const { locale, t } = useLanguage()
  const id = useId()
  const isDisabled = disabled || versions.length < 2
  return <div className="mt-1 flex min-w-0 items-center gap-1.5 text-[11px] text-muted-foreground">
    <label htmlFor={id} className="shrink-0">{t('edition')}</label>
    <div className="relative min-w-0">
      <select id={id} value={book.id} disabled={isDisabled}
        aria-label={t('chooseEdition', { title: book.title })}
        className="block h-6 max-w-full min-w-0 cursor-pointer appearance-none rounded-none border-0 bg-transparent p-0 pr-3 text-[11px] text-muted-foreground shadow-none focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2 disabled:cursor-default disabled:pr-0 disabled:text-muted-foreground/50"
        onChange={(event) => {
          const selected = versions.find((version) => version.id === event.target.value)
          if (selected) onChange(selected)
        }}>
        {versions.map((version) => <option key={version.id} value={version.id}>
          {contentLanguageName(version.language, locale)} · {version.format.toUpperCase()}{version.title !== book.title ? ` · ${version.title}` : ''}
        </option>)}
      </select>
      {!isDisabled && <ChevronDown aria-hidden="true" className="pointer-events-none absolute right-0 top-1/2 size-2.5 -translate-y-1/2 opacity-50" />}
    </div>
  </div>
}
