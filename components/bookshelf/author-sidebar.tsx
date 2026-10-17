"use client"

import Link from 'next/link'
import Image from 'next/image'
import { User } from 'lucide-react'
import { useLanguage } from '@/components/language-provider'
import { authorName, authorHref, type Author } from '@/lib/metadata'
import { assetHref } from '@/lib/site'
import { cn } from '@/lib/utils'

export function AuthorSidebar({ authors, selectedAuthor }: { authors: Author[]; selectedAuthor: string }) {
  const { locale, t } = useLanguage()
  return (
    <aside className="w-full md:w-56 lg:w-64 shrink-0 border rounded-xl">
      <h2 className="p-3 border-b bg-muted/50 font-semibold text-sm flex items-center gap-2">
        <User className="h-4 w-4" />{t('chooseAuthor')}
      </h2>
      <nav className="p-2" aria-label={t('chooseAuthor')}>
        {authors.map((author) => {
          const name = authorName(author, locale)
          return <Link key={author.id} href={authorHref(author)} prefetch={false}
            aria-current={selectedAuthor === author.id ? 'page' : undefined}
            className={cn('w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-3',
              selectedAuthor === author.id ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-muted-foreground hover:text-foreground')}>
            <Image src={assetHref(author.avatar)} alt="" width={32} height={32} className="object-cover w-8 h-8 rounded-full shrink-0" />
            <span className="min-w-0 truncate" title={name}>{name}</span>
          </Link>
        })}
      </nav>
    </aside>
  )
}
