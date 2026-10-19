'use client'

import { useEffect, useRef, useState } from 'react'
import { List, X } from 'lucide-react'
import { useLanguage } from '@/components/language-provider'
import { Button } from '@/components/ui/button'
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import './chapter-navigation.css'

export type ChapterLink = { id: string; title: string; level?: number }

export function ChapterNavigation({ chapters, activeId, onSelect, loading = false }: {
  chapters: ChapterLink[]; activeId: string; onSelect: (id: string) => void; loading?: boolean
}) {
  const { t } = useLanguage()
  const [open, setOpen] = useState(false)
  const desktopList = useRef<HTMLDivElement>(null)
  const mobileList = useRef<HTMLDivElement>(null)
  const pendingSelection = useRef<string | null>(null)

  useEffect(() => {
    const wide = window.matchMedia('(min-width: 1024px)')
    const change = () => { if (wide.matches) setOpen(false) }
    wide.addEventListener('change', change)
    return () => wide.removeEventListener('change', change)
  }, [])

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      for (const list of [desktopList.current, mobileList.current]) {
        const active = list?.querySelector<HTMLElement>('[aria-current="location"]')
        if (!list || !active) continue
        const box = list.getBoundingClientRect(), item = active.getBoundingClientRect()
        // Scroll only the contents list, never the document being read.
        if (item.top < box.top) list.scrollTop += item.top - box.top
        else if (item.bottom > box.bottom) list.scrollTop += item.bottom - box.bottom
      }
    })
    return () => cancelAnimationFrame(frame)
  }, [activeId, open])

  const list = (mobile: boolean) => <nav aria-label={t('contents')}>
    {loading ? <p role="status" className="p-3 text-sm text-muted-foreground">{t('detectingChapters')}</p>
      : !chapters.length ? <p className="p-3 text-sm text-muted-foreground">{t('noChapters')}</p>
      : <ol className="space-y-0.5 p-1">
        {chapters.map(chapter => <li key={chapter.id}>
          <button type="button" aria-current={chapter.id === activeId ? 'location' : undefined} title={chapter.title}
            style={{ paddingInlineStart: 12 + (chapter.level || 0) * 12 }}
            className={`min-h-11 w-full rounded-md py-2 pr-3 text-left text-sm leading-relaxed break-words [overflow-wrap:anywhere] transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${chapter.id === activeId ? 'bg-accent text-accent-foreground font-medium' : 'text-muted-foreground'}`}
            onClick={() => {
              if (mobile) { pendingSelection.current = chapter.id; setOpen(false) }
              else onSelect(chapter.id)
            }}>{chapter.title}</button>
        </li>)}
      </ol>}
  </nav>

  return <>
    <aside className="reader-chapters-sidebar" aria-label={t('contents')}>
      <h2 className="px-3 pb-3 text-sm font-medium">{t('contents')}</h2>
      <div ref={desktopList} className="reader-chapters-list min-h-0 flex-1">{list(false)}</div>
    </aside>
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="reader-chapters-trigger min-h-11 rounded-full bg-background/95 px-3 shadow-sm backdrop-blur" aria-label={t('contents')}>
          <List aria-hidden="true" />{t('contents')}
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[min(85vw,20rem)] gap-0 [&>button]:hidden" onCloseAutoFocus={(event) => {
        if (pendingSelection.current) {
          event.preventDefault()
          const id = pendingSelection.current
          pendingSelection.current = null
          onSelect(id)
        }
      }}>
        <SheetHeader className="border-b">
          <div className="flex items-center justify-between gap-2">
            <SheetTitle>{t('contents')}</SheetTitle>
            <SheetClose asChild><Button variant="ghost" size="icon" className="size-11" aria-label={t('closeContents')}><X aria-hidden="true" /></Button></SheetClose>
          </div>
          <SheetDescription className="sr-only">{t('chooseChapter')}</SheetDescription>
        </SheetHeader>
        <div ref={mobileList} className="reader-chapters-list min-h-0 flex-1 p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">{list(true)}</div>
      </SheetContent>
    </Sheet>
  </>
}
