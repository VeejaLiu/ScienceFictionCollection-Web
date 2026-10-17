'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Eye } from 'lucide-react'
import { authorName, bookHref, type Author, type Book } from '@/lib/metadata'
import { estimateReadingTime } from '@/lib/reading-time'
import { getStorageKey, loadProgress } from '@/lib/reading-progress'
import { useLanguage } from '@/components/language-provider'
import { BookArtwork } from './book-artwork'
import { EditionSwitcher } from './edition-switcher'

export function BookCover({ book, author, versions, onVersionChange }: { book: Book; author: Author; versions: Book[]; onVersionChange: (book: Book) => void }) {
  const { locale, t } = useLanguage()
  const readingTime = ['txt', 'md'].includes(book.format) ? estimateReadingTime(book.size, t) : book.format.toUpperCase()
  const [progress, setProgress] = useState(0)
  useEffect(() => {
    setProgress(Math.round(loadProgress(getStorageKey('', author.id, book.id)) * 1000) / 10)
  }, [author.id, book.id])

  return <div className="w-full max-w-60 mx-auto py-3 perspective-[1200px]">
    <Link href={bookHref(book)} prefetch={false} aria-label={book.title}
      className="group block relative w-full rounded-sm shadow-[-6px_0px_20px_-4px_rgba(0,0,0,0.15)] transition-transform duration-300 rotate-y-[15deg] hover:rotate-y-0 hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-4">
      <BookArtwork book={book} author={author} />
      <div className="relative rounded-b-sm border border-amber-200 bg-amber-100 text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
        {progress > 0 && <div className="h-0.5 overflow-hidden bg-amber-200 dark:bg-amber-800" aria-hidden>
          <div className="h-full bg-amber-500" style={{ width: `${Math.min(100, progress)}%` }} />
        </div>}
        {book.cover && book.coverStyle !== 'artwork' && <div className="px-3 pt-3">
          <b lang={book.language} className="block text-sm leading-snug line-clamp-2">{book.title}</b>
          <span className="mt-1 block text-[11px] leading-relaxed">{authorName(author, locale)}</span>
        </div>}
        <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 px-3 py-2 text-[11px] leading-relaxed">
          <span>{readingTime}</span>
          {progress > 0 && <span className="flex items-center gap-1 tabular-nums"><Eye className="size-3 shrink-0" />{progress.toFixed(0)}%</span>}
        </div>
      </div>
    </Link>
    <EditionSwitcher book={book} versions={versions} onChange={onVersionChange} />
  </div>
}
