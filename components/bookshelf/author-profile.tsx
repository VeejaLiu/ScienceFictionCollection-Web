'use client'

import Image from 'next/image'
import { ChevronDown } from 'lucide-react'
import { useLanguage } from '@/components/language-provider'
import { authorBio, authorName, isPeriodical, type Author } from '@/lib/metadata'
import { assetHref } from '@/lib/site'

export function AuthorProfile({ author }: { author: Author }) {
  const { locale, t } = useLanguage()
  const bio = authorBio(author, locale)
  if (!bio) return null
  const title = `${authorName(author, locale)} · ${t(isPeriodical(author) ? 'aboutPeriodical' : 'aboutAuthor')}`
  const sources = !!author.sources?.length && <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
    <span>{t('references')}</span>
    {author.sources?.map((source) => <a key={source.url} href={source.url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-foreground">{source.label}</a>)}
  </div>
  return <>
    <details key={author.id} className="author-profile-compact group rounded-xl border bg-muted/20">
      <summary className="relative min-h-12 cursor-pointer list-none p-3 pr-9 focus-visible:outline-2 focus-visible:outline-ring [&::-webkit-details-marker]:hidden">
        <span className="block text-sm font-semibold">{title}</span>
        <span className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground group-open:hidden">{bio}</span>
        <ChevronDown className="absolute right-3 top-4 size-4 transition-transform group-open:rotate-180" aria-hidden="true" />
      </summary>
      <div className="px-3 pb-4">
        <p className="text-sm leading-7 text-muted-foreground">{bio}</p>
        {sources}
      </div>
    </details>
    <section className="author-profile-desktop rounded-xl border bg-muted/20 p-4 sm:p-5" aria-labelledby={`author-profile-${author.id}`}>
      <div className="flex items-start gap-4">
        <Image src={assetHref(author.avatar)} alt="" width={64} height={64} className="w-16 h-16 rounded-full object-cover shrink-0" />
        <div className="min-w-0">
          <h2 id={`author-profile-${author.id}`} className="font-semibold">{title}</h2>
          <p className="mt-2 text-sm leading-7 text-muted-foreground">{bio}</p>
          {sources}
        </div>
      </div>
    </section>
  </>
}
