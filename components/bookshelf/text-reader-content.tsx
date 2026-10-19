'use client'

import { Fragment, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { useLanguage } from '@/components/language-provider'
import { createTextChapters, normalizeChapterInput, type TextChapter } from '@/lib/text-chapters'
import { readerFonts, type ReaderSettings } from '@/lib/reader-settings'
import { textParagraphs } from '@/lib/text-paragraphs'
import type { ChapterTitleCorrection } from '@/lib/metadata'
import { withBasePath } from '@/lib/site'
import { ChapterNavigation } from './chapter-navigation'
import './text-reader-content.css'

function bodyText(value: string, sourceStart: number) {
  let offset = 0
  const paragraphs = textParagraphs(value).map(paragraph => {
    const before = value.slice(offset, paragraph.start)
    offset = paragraph.end
    return <Fragment key={paragraph.start}>{before && <span hidden aria-hidden="true">{before}</span>}<p className="reader-paragraph" data-reader-paragraph={sourceStart + paragraph.start}>
      {paragraph.indentEnd > paragraph.start && <span className="reader-original-indent">{value.slice(paragraph.start, paragraph.indentEnd)}</span>}{value.slice(paragraph.indentEnd, paragraph.end)}
    </p></Fragment>
  })
  return <>{paragraphs}{offset < value.length && <span hidden aria-hidden="true">{value.slice(offset)}</span>}</>
}

export function TextReaderContent({ content, language, format, settings, chapterTitleCorrections, onLayoutReady }: {
  content: string; language: string; format: string; settings: ReaderSettings; chapterTitleCorrections?: ChapterTitleCorrection[]; onLayoutReady?: (content: string) => void
}) {
  const { t } = useLanguage()
  const article = useRef<HTMLElement>(null)
  const anchors = useRef(new Map<string, HTMLSpanElement>())
  const [model, setModel] = useState<{ content: string; chapters: TextChapter[] } | null>(null)
  const [activeId, setActiveId] = useState('')

  useEffect(() => {
    let worker: Worker | undefined, timer: ReturnType<typeof setTimeout> | undefined
    let finished = false
    const finish = (result: unknown) => {
      if (finished) return
      finished = true
      clearTimeout(timer)
      worker?.terminate()
      setModel({ content, chapters: createTextChapters(content, result, format, chapterTitleCorrections) })
    }
    try {
      worker = new Worker(withBasePath('/vendor/treader-toc/worker.js'))
      worker.onmessage = event => finish(event.data)
      worker.onerror = () => finish(null)
      timer = setTimeout(() => finish(null), 8000)
      worker.postMessage(normalizeChapterInput(content))
    } catch { finish(null) }
    return () => { finished = true; clearTimeout(timer); worker?.terminate() }
  }, [content, format, chapterTitleCorrections])

  const ready = model?.content === content
  useLayoutEffect(() => { if (ready) onLayoutReady?.(content) }, [ready, content, onLayoutReady])
  const chapters = useMemo(() => {
    if (!ready || !model?.chapters.length) return []
    const first = model.chapters[0]
    return first.start > 0 && content.slice(0, first.start).trim()
      ? [{ id: 'text-chapter-beginning', title: t('beginning'), start: 0, end: 0, level: 0 }, ...model.chapters]
      : model.chapters
  }, [ready, model, content, t])

  useEffect(() => {
    if (!chapters.length) { setActiveId(''); return }
    let offsets: { id: string; top: number }[] = []
    let measureFrame = 0, scrollFrame = 0
    const updateActive = () => {
      const top = window.scrollY + (document.querySelector('header')?.getBoundingClientRect().bottom || 0) + 40
      let low = 0, high = offsets.length - 1
      while (low <= high) {
        const mid = (low + high) >>> 1
        if (offsets[mid].top <= top) low = mid + 1
        else high = mid - 1
      }
      setActiveId(offsets[Math.max(0, high)]?.id || '')
    }
    const measure = () => {
      offsets = chapters.flatMap(chapter => {
        const element = anchors.current.get(chapter.id)
        return element ? [{ id: chapter.id, top: element.getBoundingClientRect().top + window.scrollY }] : []
      })
      updateActive()
    }
    const scheduleMeasure = () => { cancelAnimationFrame(measureFrame); measureFrame = requestAnimationFrame(measure) }
    const scroll = () => { cancelAnimationFrame(scrollFrame); scrollFrame = requestAnimationFrame(updateActive) }
    const resize = new ResizeObserver(scheduleMeasure)
    if (article.current) resize.observe(article.current)
    scheduleMeasure()
    window.addEventListener('scroll', scroll, { passive: true })
    window.addEventListener('resize', scheduleMeasure)
    return () => { cancelAnimationFrame(measureFrame); cancelAnimationFrame(scrollFrame); resize.disconnect(); window.removeEventListener('scroll', scroll); window.removeEventListener('resize', scheduleMeasure) }
  }, [chapters])

  const text = useMemo(() => {
    let offset = 0
    const titles = chapters.map(chapter => {
    const before = content.slice(offset, chapter.start)
    const heading = content.slice(chapter.start, chapter.end)
    const hasHeading = Boolean(heading.trim())
    const precedingText = bodyText(before, offset)
    const leading = heading.length - heading.trimStart().length
    const trailing = Math.max(leading, heading.trimEnd().length)
    offset = chapter.end
    return <Fragment key={chapter.id}>{precedingText}<span id={chapter.id} ref={element => {
      if (element) anchors.current.set(chapter.id, element)
      else anchors.current.delete(chapter.id)
    }} data-reader-chapter={chapter.id} data-chapter-level={chapter.level} role={hasHeading ? 'heading' : undefined} aria-level={hasHeading ? 2 + chapter.level : undefined}
      aria-label={hasHeading ? undefined : chapter.title} tabIndex={-1} className={`${hasHeading ? 'reader-chapter-title ' : ''}scroll-mt-24 outline-none`}>
      {leading > 0 && <span hidden aria-hidden="true">{heading.slice(0, leading)}</span>}{heading.slice(leading, trailing)}{trailing < heading.length && <span hidden aria-hidden="true">{heading.slice(trailing)}</span>}
    </span></Fragment>
    })
    return <>{titles}{bodyText(content.slice(offset), offset)}</>
  }, [content, chapters])

  return <>
    <ChapterNavigation chapters={chapters} activeId={activeId} loading={!ready} onSelect={id => {
      const target = anchors.current.get(id)
      if (!target) return
      setActiveId(id)
      target.scrollIntoView({ block: 'start', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })
      target.focus({ preventScroll: true })
    }} />
    <article ref={article} lang={language} data-reader-indent={settings.indent} style={{ fontSize: settings.fontSize, lineHeight: settings.lineHeight,
      fontFamily: readerFonts[settings.font], fontWeight: settings.fontWeight, letterSpacing: `${settings.letterSpacing}em`, textAlign: settings.alignment,
      '--reader-paragraph-space': `${settings.paragraphSpacing}em` } as CSSProperties} className="reader-text break-words">
      {text}
    </article>
  </>
}
