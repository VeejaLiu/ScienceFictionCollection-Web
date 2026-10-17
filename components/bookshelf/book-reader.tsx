"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ReadingProgressBar } from './reading-progress-bar'
import { useLanguage } from '@/components/language-provider'
import { authorName, authorHref, bookHref, rawBookUrl, type Author, type Book } from '@/lib/metadata'
import { BookArtwork } from './book-artwork'
import { EditionSwitcher } from './edition-switcher'
import { useEditionPreferences } from './use-edition-preferences'
import { contentLanguage, readingVersion } from '@/lib/book-versions'
import { getStorageKey } from '@/lib/reading-progress'

export function BookReader({ book, author, versions }: { book: Book; author: Author; versions: Book[] }) {
  const { locale, ready, t } = useLanguage()
  const router = useRouter()
  const preferences = useEditionPreferences()
  const selected = versions.find((version) => version.id === preferences.choices[`${locale}:${book.workId}`]) || readingVersion(book, versions, locale)
  const canRead = selected?.id === book.id
  const language = contentLanguage(book.language)
  const languageName = language ? new Intl.DisplayNames([locale], { type: 'language' }).of(language) || book.language : book.language
  useEffect(() => {
    if (ready && preferences.ready && selected && !canRead) router.replace(bookHref(selected), { scroll: false })
  }, [ready, preferences.ready, selected, canRead, router])
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

  return <main className="w-full max-w-4xl mx-auto p-4 md:p-8 min-h-screen">
    <div className="flex gap-5 mb-8 border-b pb-6">
      {book.cover && <div className="w-28 sm:w-40 shrink-0 self-start"><BookArtwork book={book} author={author} /></div>}
      <div>
        <h1 className="font-serif font-bold text-2xl md:text-3xl mb-3">{book.title}</h1>
        <Link href={authorHref(author)} className="text-sm underline underline-offset-4">
          {t('author', { author: authorName(author, locale) })}
        </Link>
        {book.series && <p className="text-sm text-muted-foreground mt-3">{book.series.split('/').join(' / ')}</p>}
        <p className="text-sm text-muted-foreground mt-3">{book.format.toUpperCase()} · {languageName}</p>
        {language !== contentLanguage(locale) && <p className="text-sm text-muted-foreground mt-3">{t('fallbackLanguage', { language: languageName })}</p>}
        <a href={rawBookUrl(author, book)} target="_blank" rel="noopener noreferrer" className="text-sm underline block mt-3">{t('sourceFile')}</a>
        {book.coverSource && <a href={book.coverSource.url} target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground underline block mt-3">{t('coverSource')} · {book.coverSource.label}</a>}
        <div className="max-w-sm"><EditionSwitcher book={book} versions={versions} onChange={(version) => preferences.select(version, locale)} /></div>
      </div>
    </div>
    {!ready || !preferences.ready || (selected && !canRead) ? <p role="status">{t('loading')}</p> : !selected ? <p>{t('noLanguageVersion')}</p> : !book.size ? <p>{t('emptyBook')}</p> : !readable ? <p>{t('downloadOnly')}</p> : content === null ?
      <div className="py-8">
        {failed ? <div>
          <p role="alert" className="mb-4 text-destructive">{t('readError')}</p>
          <button onClick={() => { setFailed(false); setAttempt((value) => value + 1) }} className="rounded-md bg-primary text-primary-foreground px-5 py-3">
            {t('retry')}
          </button>
        </div> : <p role="status" aria-live="polite" className="text-muted-foreground">{t('loading')}</p>}
      </div> :
      <ReadingProgressBar storageKey={getStorageKey('', author.id, book.id)}>
        <article lang={book.language} className="font-serif leading-loose whitespace-pre-wrap text-justify text-xl">{content}</article>
      </ReadingProgressBar>}
  </main>
}
