'use client'

import { BookOpen } from 'lucide-react'
import { GitHubFile } from '@/lib/github'
import { BookCover } from './book-cover'
import { getBookPath } from '@/lib/book-path'
import { useLanguage } from '@/components/language-provider'

interface BooksGridProps {
  books: GitHubFile[]
  author: string
  onBookClick: (file: GitHubFile) => void
  loading?: boolean
}

export function BooksGrid({
  books,
  author,
  onBookClick,
  loading = false,
}: BooksGridProps) {
  const { t } = useLanguage()
  const groups = new Map<string, GitHubFile[]>()
  for (const book of books) {
    const relativePath = getBookPath(book, author)
    const directory = relativePath.slice(0, relativePath.lastIndexOf('/') + 1).replace(/\/$/, '')
    const group = groups.get(directory) || []
    group.push(book)
    groups.set(directory, group)
  }
  // Show standalone works first, then series in directory order.
  const sections = [...groups].sort(([a], [b]) => a.localeCompare(b))
  return (
    <div className="flex-1 min-w-0 border rounded-xl">
      <div className="p-4 border-b bg-muted/30">
        <h2 className="font-semibold text-sm">
          {author ? t('authorWorks', { author, count: books.length }) : t('works')}
        </h2>
      </div>
      <div className="p-4 overflow-visible">
        {!author ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <BookOpen className="h-16 w-16 mb-4 opacity-20" />
            <p className="text-sm">{t('chooseAuthorHint')}</p>
          </div>
        ) : (
          <div className="space-y-6">
            {sections.map(([directory, works]) => (
              <section key={directory}>
                {(directory || sections.length > 1) && (
                  <h3 className="px-2 pb-2 text-sm font-semibold text-muted-foreground">
                    {directory ? directory.split('/').join(' / ') : t('otherWorks')}
                  </h3>
                )}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 overflow-visible">
                  {works.map((item) => (
                    <BookCover
                      key={item.path}
                      book={item}
                      author={author}
                      onClick={() => onBookClick(item)}
                    />
                  ))}
                </div>
              </section>
            ))}
            {books.length === 0 && author && !loading && (
              <div className="col-span-full flex flex-col items-center justify-center py-20 text-muted-foreground">
                <BookOpen className="h-16 w-16 mb-4 opacity-20" />
                <p className="text-sm">{t('noWorks')}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
