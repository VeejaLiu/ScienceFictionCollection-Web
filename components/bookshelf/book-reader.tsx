"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { ReadingProgressBar } from './reading-progress-bar'
import { useLanguage } from '@/components/language-provider'
import { authorName, authorHref, bookHref, rawBookUrl, type Author, type Book } from '@/lib/metadata'
import { BookArtwork } from './book-artwork'
import { EditionSwitcher } from './edition-switcher'
import { useEditionPreferences } from './use-edition-preferences'
import { contentLanguage, contentLanguageName, readingVersion } from '@/lib/book-versions'
import { ReaderSettingsBar, useReaderSettings } from './reader-settings'
import { getStorageKey, readScrollMetrics } from '@/lib/reading-progress'

const EpubReader = dynamic(() => import('./epub-reader').then((module) => module.EpubReader), { ssr: false })

export function BookReader({ book, author, versions }: { book: Book; author: Author; versions: Book[] }) {
  const { locale, ready, t } = useLanguage()
  const router = useRouter()
  const display = useReaderSettings()
  const preferences = useEditionPreferences()
  const selected = readingVersion(book, versions, locale, preferences.choices[`${locale}:${book.workId}`])
  const canRead = selected?.id === book.id
  const language = contentLanguage(book.language)
  const languageName = contentLanguageName(book.language, locale)
  useEffect(() => {
    if (ready && preferences.ready && selected && !canRead) router.replace(bookHref(selected), { scroll: false })
  }, [ready, preferences.ready, selected, canRead, router])
  const [layoutAnchor, setLayoutAnchor] = useState<number | null>(null)
  const [content, setContent] = useState<string | null>(null)
  const [failed, setFailed] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const readable = ['txt', 'md'].includes(book.format)
  const url = rawBookUrl(author, book)

  useEffect(() => {
    setContent(null); setFailed(false)
    if (!ready || !preferences.ready || !canRead || !readable || !book.size) return
    const controller = new AbortController()
    const load = async () => {
      try {
        const response = await fetch(url, { signal: controller.signal })
        if (!response.ok) throw new Error('Unable to load book')
        const text = new TextDecoder('utf-8', { fatal: true }).decode(await response.arrayBuffer())
        if (!controller.signal.aborted) setContent(text)
      } catch {
        if (!controller.signal.aborted) setFailed(true)
      }
    }
    void load()
    return () => { controller.abort() }
  }, [url, readable, book.size, attempt, ready, preferences.ready, canRead])

  return <main className="w-full max-w-4xl mx-auto p-3 sm:p-6 md:p-8 min-h-screen">
    <div className="mb-6 sm:mb-8 border-b pb-4">
      <div className="flex items-start gap-4 sm:gap-6">
        {book.cover && <div className="w-20 sm:w-32 shrink-0 self-start"><BookArtwork book={book} author={author} /></div>}
        <div className="min-w-0 flex-1 break-words">
          <h1 className="font-serif font-bold text-2xl md:text-3xl mb-2">{book.title}</h1>
          <Link href={authorHref(author)} className="inline-flex min-h-11 items-center text-sm underline underline-offset-4">
            {t('author', { author: authorName(author, locale) })}
          </Link>
          <p className="text-sm text-muted-foreground mt-2">{book.format.toUpperCase()} · {languageName}</p>
          {language !== contentLanguage(locale) && <p className="text-sm text-muted-foreground mt-2">{t('fallbackLanguage', { language: languageName })}</p>}
          <div className="max-w-sm"><EditionSwitcher book={book} versions={versions} disabled={!ready || !preferences.ready} onChange={(version) => { preferences.select(version, locale); router.replace(bookHref(version), { scroll: false }) }} /></div>
        </div>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-x-4">
        <a href={rawBookUrl(author, book)} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center text-sm underline">{t('sourceFile')}</a>
        {book.coverSource && <a href={book.coverSource.url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center text-xs text-muted-foreground underline">{t('coverSource')} · {book.coverSource.label}</a>}
      </div>
    </div>
    {ready && preferences.ready && canRead && book.size > 0 && (readable || book.format === 'epub') && <ReaderSettingsBar settings={display.settings} onChange={(settings) => { const metrics = readScrollMetrics(); setLayoutAnchor(metrics.maxScroll > 0 ? metrics.scrollTop / metrics.maxScroll : 0); display.update(settings) }} />}
    {!ready || !preferences.ready || !display.ready || (selected && !canRead) ? <p role="status">{t('loading')}</p> : !selected ? <p>{t('noLanguageVersion')}</p> : !book.size ? <p>{t('emptyBook')}</p> : book.format === 'epub' ? <EpubReader url={url} storageKey={getStorageKey('', author.id, book.id)} settings={display.settings} /> : !readable ? <p>{t('downloadOnly')}</p> : content === null ?
      <div className="py-8">
        {failed ? <div>
          <p role="alert" className="mb-4 text-destructive">{t('readError')}</p>
          <button onClick={() => { setFailed(false); setAttempt((value) => value + 1) }} className="rounded-md bg-primary text-primary-foreground px-5 py-3">
            {t('retry')}
          </button>
        </div> : <p role="status" aria-live="polite" className="text-muted-foreground">{t('loading')}</p>}
      </div> :
      <ReadingProgressBar storageKey={getStorageKey('', author.id, book.id)} layoutKey={`${display.settings.fontSize}:${display.settings.lineHeight}`} layoutAnchor={layoutAnchor}>
        <article lang={book.language} style={{ fontSize: display.settings.fontSize, lineHeight: display.settings.lineHeight }} className="font-serif whitespace-pre-wrap break-words text-justify pt-4">{content}</article>
      </ReadingProgressBar>}
  </main>
}
