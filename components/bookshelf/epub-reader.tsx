'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { Book as EpubBook, Rendition, Location } from 'epubjs'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useLanguage } from '@/components/language-provider'
import { Button } from '@/components/ui/button'
import { flattenContents, validEpubCfi, type ReaderSettings } from '@/lib/reader-settings'
import { saveProgress } from '@/lib/reading-progress'

export function EpubReader({ url, storageKey, settings }: { url: string; storageKey: string; settings: ReaderSettings }) {
  const { t } = useLanguage()
  const container = useRef<HTMLDivElement>(null)
  const rendition = useRef<Rendition | null>(null)
  const readyRef = useRef(false)
  const busyRef = useRef(false)
  const settingsRef = useRef(settings)
  settingsRef.current = settings
  const applyStyle = useRef<(() => void) | null>(null)
  const [ready, setReady] = useState(false)
  const [failed, setFailed] = useState(false)
  const [busy, setBusy] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const [contents, setContents] = useState<{ href: string; label: string }[]>([])
  const [chapter, setChapter] = useState('')
  const [section, setSection] = useState({ current: 1, total: 1, page: 1, pages: 1 })
  const [ends, setEnds] = useState({ start: true, end: false })

  const navigate = useCallback(async (target: 'previous' | 'next' | { href: string }) => {
    const reader = rendition.current
    if (!reader || !readyRef.current || busyRef.current) return
    busyRef.current = true; setBusy(true)
    try {
      if (target === 'previous') await reader.prev()
      else if (target === 'next') await reader.next()
      else await reader.display(target.href)
    } catch { if (readyRef.current) setFailed(true) }
    finally { busyRef.current = false; if (readyRef.current) setBusy(false) }
  }, [])

  useEffect(() => {
    const abort = new AbortController()
    let book: EpubBook | undefined
    let resize: ResizeObserver | undefined
    let theme: MutationObserver | undefined
    setReady(false); setFailed(false); setBusy(false); setContents([])
    readyRef.current = false; busyRef.current = false
    const handleKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      if (event.altKey || event.ctrlKey || event.metaKey || target?.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target?.tagName || '')) return
      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
        event.preventDefault()
        void navigate(event.key === 'ArrowRight' ? 'next' : 'previous')
      }
    }
    const load = async () => {
      try {
        const [module, response] = await Promise.all([import('epubjs'), fetch(url, { signal: abort.signal })])
        if (!response.ok) throw new Error('Unable to load EPUB')
        const buffer = await response.arrayBuffer()
        if (abort.signal.aborted || !container.current) return
        book = module.default(buffer, { replacements: 'blobUrl' })
        // Remove active markup before section HTML is serialized into its frame.
        book.spine.hooks.content.register((doc: Document) => {
          doc.querySelectorAll('script,iframe,object,embed,form,meta[http-equiv]').forEach((element) => element.remove())
          doc.querySelectorAll('*').forEach((element) => {
            for (const attribute of Array.from(element.attributes)) {
              if (/^on/i.test(attribute.name) || attribute.name === 'srcdoc'
                || (/^(href|src|xlink:href)$/i.test(attribute.name) && /^\s*(javascript|vbscript):/i.test(attribute.value))) element.removeAttribute(attribute.name)
            }
          })
        })
        await book.ready
        const navigation = await book.loaded.navigation
        if (abort.signal.aborted || !container.current) return
        const chapters = flattenContents(navigation.toc)
        setContents(chapters)
        let width = container.current.clientWidth, height = container.current.clientHeight
        const reader = book.renderTo(container.current, { width, height, flow: 'paginated', spread: 'none', allowScriptedContent: false })
        rendition.current = reader
        const style = () => {
          if (abort.signal.aborted) return
          const body = getComputedStyle(document.body)
          const value = settingsRef.current
          reader.themes.default({
            body: { color: `${body.color} !important`, background: `${body.backgroundColor} !important`, 'font-family': 'system-ui, serif !important' },
            'body *': { 'font-family': 'inherit !important' },
            'p, li': { 'line-height': `${value.lineHeight} !important` },
          })
          reader.themes.fontSize(`${value.fontSize}px`)
          reader.themes.override('line-height', String(value.lineHeight), true)
        }
        applyStyle.current = style
        style()
        reader.on('relocated', (location: Location) => {
          if (abort.signal.aborted || !location.start) return
          const start = location.start
          const count = (book!.spine as unknown as { length: number }).length || 1
          setSection({ current: start.index + 1, total: count, page: start.displayed.page, pages: start.displayed.total })
          setEnds({ start: location.atStart, end: location.atEnd })
          const path = start.href.split('#')[0]
          setChapter(chapters.find((item) => item.href.split('#')[0] === path)?.href || '')
          const fraction = (start.index + (start.displayed.page - 1) / Math.max(1, start.displayed.total)) / count
          saveProgress(storageKey, location.atEnd ? 1 : Math.min(1, Math.max(0, fraction)))
          if (validEpubCfi(start.cfi)) {
            try { localStorage.setItem(`${storageKey}:epub-cfi`, start.cfi) } catch { /* Local progress is optional. */ }
          }
        })
        reader.on('keydown', handleKey)
        let touch: { x: number; y: number } | null = null
        reader.on('touchstart', (event: TouchEvent) => { const point = event.touches[0]; touch = point ? { x: point.clientX, y: point.clientY } : null })
        reader.on('touchend', (event: TouchEvent) => {
          const point = event.changedTouches[0]
          if (point && touch) {
            const dx = point.clientX - touch.x, dy = point.clientY - touch.y
            if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.8) void navigate(dx < 0 ? 'next' : 'previous')
          }
          touch = null
        })
        let saved: string | null = null
        try { saved = localStorage.getItem(`${storageKey}:epub-cfi`) } catch { /* Optional progress. */ }
        try { await reader.display(validEpubCfi(saved) ? saved : undefined) }
        catch { if (!abort.signal.aborted) await reader.display() }
        if (abort.signal.aborted) return
        readyRef.current = true; setReady(true)
        resize = new ResizeObserver(([entry]) => {
          const nextWidth = Math.round(entry.contentRect.width), nextHeight = Math.round(entry.contentRect.height)
          if (readyRef.current && nextWidth && nextHeight && (Math.abs(nextWidth - width) > 1 || Math.abs(nextHeight - height) > 1)) {
            width = nextWidth; height = nextHeight
            reader.resize(width, height)
          }
        })
        resize.observe(container.current)
        theme = new MutationObserver(style)
        theme.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
      } catch { if (!abort.signal.aborted) setFailed(true) }
    }
    void load()
    window.addEventListener('keydown', handleKey)
    return () => {
      abort.abort(); readyRef.current = false; rendition.current = null; applyStyle.current = null
      resize?.disconnect(); theme?.disconnect(); window.removeEventListener('keydown', handleKey)
      try { book?.destroy() } catch { /* An aborted book may only be partially initialized. */ }
    }
  }, [url, storageKey, attempt, navigate])

  useEffect(() => {
    const reader = rendition.current
    const cfi = reader?.location?.start?.cfi
    applyStyle.current?.()
    if (reader && readyRef.current && validEpubCfi(cfi)) void reader.display(cfi).catch(() => {})
  }, [settings.fontSize, settings.lineHeight])

  return <section aria-label={t('epubReader')} className="min-w-0 rounded-lg border mt-4 overflow-hidden">
    <div className="flex flex-wrap items-center justify-between gap-2 border-b bg-muted/30 p-2">
      <label className="flex min-w-0 flex-1 basis-40 items-center gap-2 text-sm">
        <span className="shrink-0">{t('contents')}</span>
        <select aria-label={t('contents')} value={chapter} disabled={!ready || busy || !contents.length} className="min-w-0 w-full min-h-11 rounded-md border bg-background px-2 text-base" onChange={(event) => { if (event.target.value) void navigate({ href: event.target.value }) }}>
          <option value="">{t('contents')}</option>
          {contents.map((item, index) => <option key={`${item.href}:${index}`} value={item.href}>{item.label}</option>)}
        </select>
      </label>
      <div className="px-2 text-xs text-muted-foreground tabular-nums" aria-live="polite"><span>{t('epubSection', section)}</span><span className="block mt-1">{t('epubPage', { current: section.page, total: section.pages })}</span></div>
    </div>
    {!ready && !failed && <p role="status" className="p-4">{t('loading')}</p>}
    {failed && <div className="p-4"><p role="alert" className="mb-3 text-destructive">{t('readError')}</p><Button className="min-h-11" onClick={() => setAttempt((value) => value + 1)}>{t('retry')}</Button></div>}
    <div ref={container} className="w-full h-[65dvh] min-h-80 max-h-[56rem]" aria-busy={!ready} />
    <div className="flex items-center justify-between gap-2 border-t bg-background p-2">
      <Button variant="outline" className="min-h-11" disabled={!ready || busy || ends.start} onClick={() => void navigate('previous')}><ChevronLeft aria-hidden="true" />{t('previousPage')}</Button>
      <Button variant="outline" className="min-h-11" disabled={!ready || busy || ends.end} onClick={() => void navigate('next')}>{t('nextPage')}<ChevronRight aria-hidden="true" /></Button>
    </div>
  </section>
}
