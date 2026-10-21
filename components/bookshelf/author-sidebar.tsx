"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronDown, User, Newspaper } from 'lucide-react'
import { useLanguage } from '@/components/language-provider'
import { authorName, authorHref, isPeriodical, type Author } from '@/lib/metadata'
import { assetHref } from '@/lib/site'
import { cn } from '@/lib/utils'

export function AuthorSidebar({ authors, selectedAuthor }: { authors: Author[]; selectedAuthor: string }) {
  const { locale, t } = useLanguage()
  const [expanded, setExpanded] = useState(false)
  useEffect(() => { setExpanded(false) }, [selectedAuthor])
  const current = authors.find((author) => author.id === selectedAuthor)
  const entryLink = (author: Author) => {
    const name = authorName(author, locale)
    return <Link key={author.id} href={authorHref(author)} prefetch={false}
      onClick={() => setExpanded(false)}
      aria-current={selectedAuthor === author.id ? 'page' : undefined}
      className={cn('w-full min-h-11 text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-3 focus-visible:outline-2 focus-visible:outline-ring',
        selectedAuthor === author.id ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-muted-foreground hover:text-foreground')}>
      <Image src={assetHref(author.avatar)} alt="" width={32} height={32} className="object-cover w-8 h-8 rounded-full shrink-0" />
      <span className="min-w-0 truncate" title={name}>{name}</span>
    </Link>
  }
  const links = <>
    <h3 className="px-3 py-2 text-xs font-semibold text-muted-foreground">{t('novels')}</h3>
    {authors.filter((author) => !isPeriodical(author)).map(entryLink)}
    {authors.some(isPeriodical) && <>
      <h3 className="mt-3 flex items-center gap-2 border-t px-3 pb-2 pt-3 text-xs font-semibold text-muted-foreground"><Newspaper className="size-3.5" aria-hidden="true" />{t('periodicals')}</h3>
      {authors.filter(isPeriodical).map(entryLink)}
    </>}
  </>
  return <aside className="w-full md:w-48 lg:w-56 shrink-0 self-start md:sticky md:top-20">
    <details open={expanded} onToggle={(event) => setExpanded(event.currentTarget.open)} className="group rounded-xl border md:hidden">
      <summary className="flex min-h-12 cursor-pointer list-none items-center gap-2 px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-ring [&::-webkit-details-marker]:hidden">
        <User className="size-4 shrink-0" aria-hidden="true" />
        <span className="shrink-0 text-muted-foreground">{current && isPeriodical(current) ? t('periodicals') : t('chooseAuthor')}</span>
        <span className="min-w-0 flex-1 truncate font-medium">{current ? authorName(current, locale) : ''}</span>
        <ChevronDown className="size-4 shrink-0 transition-transform group-open:rotate-180" aria-hidden="true" />
      </summary>
      <nav aria-label={t('chooseAuthor')} className="max-h-[min(60dvh,24rem)] overflow-y-auto overscroll-contain border-t p-2">{links}</nav>
    </details>
    <div className="hidden max-h-[calc(100dvh-9rem)] overflow-y-auto overscroll-contain rounded-xl border md:block">
      <h2 className="p-3 border-b bg-muted/50 font-semibold text-sm flex items-center gap-2">
        <User className="h-4 w-4" aria-hidden="true" />{t('chooseAuthor')}
      </h2>
      <nav className="p-2" aria-label={t('chooseAuthor')}>{links}</nav>
    </div>
  </aside>
}
