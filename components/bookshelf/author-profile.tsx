'use client'

import Image from 'next/image'
import { useLanguage } from '@/components/language-provider'
import { authorBio, authorName, type Author } from '@/lib/metadata'
import { assetHref } from '@/lib/site'

export function AuthorProfile({ author }: { author: Author }) {
  const { locale, t } = useLanguage()
  const bio = authorBio(author, locale)
  if (!bio) return null
  return <section className="rounded-xl border bg-muted/20 p-4 sm:p-5" aria-labelledby={`author-profile-${author.id}`}>
    <div className="flex items-start gap-4">
      <Image src={assetHref(author.avatar)} alt="" width={64} height={64} className="hidden sm:block w-16 h-16 rounded-full object-cover shrink-0" />
      <div className="min-w-0">
        <h2 id={`author-profile-${author.id}`} className="font-semibold">{authorName(author, locale)} · {t('aboutAuthor')}</h2>
        <p className="mt-2 text-sm leading-7 text-muted-foreground">{bio}</p>
        {!!author.sources?.length && <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span>{t('references')}</span>
          {author.sources.map((source) => <a key={source.url} href={source.url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-foreground">{source.label}</a>)}
        </div>}
      </div>
    </div>
  </section>
}
