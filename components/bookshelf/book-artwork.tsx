'use client'

import Image from 'next/image'
import { AbstractLineSvg } from '@/components/abstract-line-svg'
import { useLanguage } from '@/components/language-provider'
import { authorName, type Author, type Book } from '@/lib/metadata'
import { assetHref } from '@/lib/site'
import { cn } from '@/lib/utils'

export function BookArtwork({ book, author, showAuthor = true }: { book: Book; author: Author; showAuthor?: boolean }) {
  const { locale } = useLanguage()
  const artwork = book.coverStyle === 'artwork'
  const showText = !book.cover || artwork
  return <div className="aspect-[2/3] relative shrink-0 overflow-hidden rounded-t-sm bg-gradient-to-b from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900">
    {book.cover
      ? <Image src={assetHref(book.cover)} alt={showText ? '' : book.title} fill sizes="(max-width: 640px) 50vw, 240px" className={artwork ? 'object-cover' : 'object-contain'} />
      : <AbstractLineSvg seed={book.title} />}
    {showText && <div className={cn('absolute inset-0 z-10 flex flex-col p-3 sm:p-5', artwork ? 'justify-end bg-gradient-to-t from-[#111c29] via-transparent to-transparent text-amber-100' : 'justify-between text-amber-800 dark:text-amber-200')}>
      <b lang={book.language} className="font-serif font-bold text-lg sm:text-2xl leading-snug break-words line-clamp-3">{book.title}</b>
      {showAuthor && <span className="mt-3 text-[10px] sm:text-xs leading-relaxed break-words">{authorName(author, locale)}</span>}
    </div>}
  </div>
}
