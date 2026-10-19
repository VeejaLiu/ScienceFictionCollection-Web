"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { BookOpen, Library, List } from 'lucide-react'
import { BookCover } from './book-cover'
import { authorName, bookHref, type Author, type Book } from '@/lib/metadata'
import { useLanguage } from '@/components/language-provider'
import { preferredVersion } from '@/lib/book-versions'
import { useEditionPreferences } from './use-edition-preferences'
import { EditionSwitcher } from './edition-switcher'
import { Button } from '@/components/ui/button'

const viewStorageKey = 'reader-books-view'
type View = 'shelf' | 'list'

export function BooksGrid({ books, author }: { books: Book[]; author: Author }) {
  const { locale, t } = useLanguage()
  const preferences = useEditionPreferences()
  const versionsByWork = new Map<string, Book[]>()
  for (const book of books) {
    const versions = versionsByWork.get(book.workId) || []
    versions.push(book); versionsByWork.set(book.workId, versions)
  }
  const visibleBooks = [...versionsByWork.entries()].flatMap(([workId, versions]) => {
    const chosen = versions.find((book) => book.id === preferences.choices[`${locale}:${workId}`]) || preferredVersion(versions, locale)
    return chosen ? [chosen] : []
  })
  const [view, setView] = useState<View>('shelf')
  useEffect(() => {
    try {
      if (localStorage.getItem(viewStorageKey) === 'list') setView('list')
    } catch { /* Browsing still works when storage is unavailable. */ }
  }, [])
  const changeView = (next: View) => {
    setView(next)
    try { localStorage.setItem(viewStorageKey, next) } catch { /* Optional preference. */ }
  }
  const groups = new Map<string, Book[]>()
  for (const book of visibleBooks) {
    const group = groups.get(book.series) || []
    group.push(book); groups.set(book.series, group)
  }
  const sections = [...groups].sort(([a], [b]) => a.localeCompare(b))
  return <div className="books-panel flex-1 min-w-0 border rounded-xl">
    <div className="p-3 sm:p-4 border-b bg-muted/30 flex flex-wrap items-center justify-between gap-3">
      <h2 className="font-semibold text-sm">{t('authorWorks', { author: authorName(author, locale), count: visibleBooks.length })}</h2>
      <div role="group" aria-label={t('viewMode')} className="flex gap-1">
        <Button size="sm" className="min-h-11" variant={view === 'shelf' ? 'default' : 'ghost'} aria-pressed={view === 'shelf'} onClick={() => changeView('shelf')}>
          <Library aria-hidden="true" />{t('shelfView')}
        </Button>
        <Button size="sm" className="min-h-11" variant={view === 'list' ? 'default' : 'ghost'} aria-pressed={view === 'list'} onClick={() => changeView('list')}>
          <List aria-hidden="true" />{t('listView')}
        </Button>
      </div>
    </div>
    <div className="p-3 sm:p-4 space-y-6">
      {sections.map(([directory, works]) => <section key={directory}>
        {(directory || sections.length > 1) && <h3 className="px-2 pb-2 text-sm font-semibold text-muted-foreground">
          {directory ? directory.split('/').join(' / ') : t('otherWorks')}
        </h3>}
        {view === 'shelf' ? <div className="books-grid">
          {works.map((book) => <BookCover key={book.workId} book={book} author={author} versions={versionsByWork.get(book.workId)!} onVersionChange={(version) => preferences.select(version, locale)} />)}
        </div> : <ul className="divide-y">
          {works.map((book) => <li key={book.id}>
            <Link href={bookHref(book)} prefetch={false} className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-md px-3 py-4 hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring">
              <span lang={book.language} className="min-w-0 flex-1 basis-40 font-medium break-words">{book.title}</span>
              <span className="text-xs text-muted-foreground">{book.format.toUpperCase()}</span>
            </Link>
            <div className="px-3 pb-4 max-w-sm"><EditionSwitcher book={book} versions={versionsByWork.get(book.workId)!} onChange={(version) => preferences.select(version, locale)} /></div>
          </li>)}
        </ul>}
      </section>)}
      {visibleBooks.length === 0 && <div className="py-20 flex flex-col items-center text-muted-foreground">
        <BookOpen className="h-16 w-16 mb-4 opacity-20" /><p>{t('noLanguageVersion')}</p>
      </div>}
    </div>
  </div>
}
