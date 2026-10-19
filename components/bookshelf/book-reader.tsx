"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { ReadingProgressBar } from './reading-progress-bar'
import { TextReaderContent } from './text-reader-content'
import { useLanguage } from '@/components/language-provider'
import { bookHref, rawBookUrl, type Author, type Book } from '@/lib/metadata'
import { useEditionPreferences } from './use-edition-preferences'
import { readingVersion } from '@/lib/book-versions'
import { ReaderSettingsBar, useReaderSettings } from './reader-settings'
import { getStorageKey, readScrollMetrics } from '@/lib/reading-progress'
import './reader-appearance.css'

const EpubReader = dynamic(() => import('./epub-reader').then((module) => module.EpubReader), { ssr: false })

export function BookReader({ book, author, versions }: { book: Book; author: Author; versions: Book[] }) {
  const { locale, ready, t } = useLanguage()
  const router = useRouter()
  const display = useReaderSettings()
  const preferences = useEditionPreferences()
  const selected = readingVersion(book, versions, locale, preferences.choices[`${locale}:${book.workId}`])
  const canRead = selected?.id === book.id
  useEffect(() => {
    if (ready && preferences.ready && selected && !canRead) router.replace(bookHref(selected), { scroll: false })
  }, [ready, preferences.ready, selected, canRead, router])
  const [layoutAnchor, setLayoutAnchor] = useState<number | null>(null)
  const [content, setContent] = useState<string | null>(null)
  const [laidOutContent, setLaidOutContent] = useState<string | null>(null)
  const [failed, setFailed] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const readable = ['txt', 'md'].includes(book.format)
  const url = rawBookUrl(author, book)

  useEffect(() => {
    if (!display.ready || !canRead || !book.size || (!readable && book.format !== 'epub')) return
    document.documentElement.dataset.readerPalette = display.settings.palette
    return () => { delete document.documentElement.dataset.readerPalette }
  }, [display.ready, display.settings.palette, canRead, book.size, readable, book.format])

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

  return <main data-reading-width={display.settings.width} className={`${book.size > 0 && (readable || book.format === 'epub') ? 'book-reading-page ' : ''}w-full max-w-4xl mx-auto p-3 sm:p-6 md:p-8 min-h-screen`}>
    <h1 className="sr-only">{book.title}</h1>
    {ready && preferences.ready && canRead && book.size > 0 && (readable || book.format === 'epub') && <ReaderSettingsBar settings={display.settings} onChange={(settings) => { const metrics = readScrollMetrics(); setLayoutAnchor(metrics.maxScroll > 0 ? metrics.scrollTop / metrics.maxScroll : 0); display.update(settings) }} />}
    {!ready || !preferences.ready || !display.ready || (selected && !canRead) ? <p role="status">{t('loading')}</p> : !selected ? <p>{t('noLanguageVersion')}</p> : !book.size ? <p>{t('emptyBook')}</p> : book.format === 'epub' ? <EpubReader url={url} storageKey={getStorageKey('', author.id, book.id)} settings={display.settings} /> : !readable ? <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center underline">{t('startReading')}</a> : content === null ?
      <div className="py-8">
        {failed ? <div>
          <p role="alert" className="mb-4 text-destructive">{t('readError')}</p>
          <button onClick={() => { setFailed(false); setAttempt((value) => value + 1) }} className="rounded-md bg-primary text-primary-foreground px-5 py-3">
            {t('retry')}
          </button>
        </div> : <p role="status" aria-live="polite" className="text-muted-foreground">{t('loading')}</p>}
      </div> :
      <ReadingProgressBar storageKey={getStorageKey('', author.id, book.id)} layoutKey={JSON.stringify(display.settings)} layoutAnchor={layoutAnchor} layoutReady={laidOutContent === content}>
        <TextReaderContent content={content} language={book.language} format={book.format} settings={display.settings} chapterTitleCorrections={book.chapterTitleCorrections} onLayoutReady={setLaidOutContent} />
      </ReadingProgressBar>}
  </main>
}
