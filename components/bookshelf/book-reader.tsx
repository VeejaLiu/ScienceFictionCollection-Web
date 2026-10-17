'use client'

import { ReadingProgressBar } from './reading-progress-bar'
import { useLanguage } from '@/components/language-provider'

interface BookReaderProps {
  title: string
  author: string
  content: string
}

export function BookReader({ title, author, content }: BookReaderProps) {
  const { t } = useLanguage()
  return (
    <div className="flex-1 flex flex-col bg-amber-50 dark:bg-amber-950/30 rounded-xl md:shadow-inner overflow-hidden min-h-[400px] md:border">
      <ReadingProgressBar>
        <div className="w-full md:max-w-3xl mx-auto px-3 py-4 md:px-10 md:py-10 lg:px-14 lg:py-14">
          <div className="mb-8 pb-6 border-b border-border text-center">
            <h1 className="font-serif font-bold text-2xl md:text-3xl text-foreground mb-3">
              {title}
            </h1>
            <p className="text-sm text-muted-foreground font-serif italic">
              {author ? t('author', { author }) : t('unknownAuthor')}
            </p>
          </div>
          <article className="prose prose-lg dark:prose-invert prose-stone mx-auto font-serif leading-loose whitespace-pre-wrap text-justify text-xl">
            {content}
          </article>
        </div>
      </ReadingProgressBar>
    </div>
  )
}
