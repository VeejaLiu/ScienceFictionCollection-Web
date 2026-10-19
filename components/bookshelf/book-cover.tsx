'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Eye } from 'lucide-react'
import { bookHref, type Author, type Book } from '@/lib/metadata'
import { getStorageKey, loadProgress } from '@/lib/reading-progress'
import { BookArtwork } from './book-artwork'
import { EditionSwitcher } from './edition-switcher'

export function BookCover({ book, author, versions, onVersionChange }: { book: Book; author: Author; versions: Book[]; onVersionChange: (book: Book) => void }) {
  const [progress, setProgress] = useState(0)
  useEffect(() => {
    setProgress(Math.round(loadProgress(getStorageKey('', author.id, book.id)) * 1000) / 10)
  }, [author.id, book.id])

  return <div className="flex h-full w-full min-w-0 max-w-60 flex-col mx-auto py-3">
    <Link href={bookHref(book)} prefetch={false} aria-label={book.title}
      className="relative flex flex-1 w-full flex-col overflow-hidden rounded-md border border-border/40 bg-card text-card-foreground focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-4">
      <BookArtwork book={book} author={author} showAuthor={false} />
      <div className="relative flex flex-1 flex-col border-t border-border/40 p-3">
        {progress > 0 && <div className="absolute inset-x-0 top-0 h-0.5 overflow-hidden bg-muted" aria-hidden>
          <div className="h-full bg-amber-500" style={{ width: `${Math.min(100, progress)}%` }} />
        </div>}
        <div className="flex items-start justify-between gap-2">
          <b lang={book.language} className="block h-10 min-w-0 flex-1 text-sm leading-5 line-clamp-2 break-words">{book.title}</b>
          {progress > 0 && <span className="flex shrink-0 items-center gap-1 text-[11px] leading-5 text-muted-foreground tabular-nums"><Eye className="size-3 shrink-0" />{progress.toFixed(0)}%</span>}
        </div>
      </div>
    </Link>
    <EditionSwitcher book={book} versions={versions} onChange={onVersionChange} />
  </div>
}
