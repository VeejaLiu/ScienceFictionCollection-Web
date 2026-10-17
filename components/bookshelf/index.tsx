"use client"

import { useLanguage } from '@/components/language-provider'
import { authorName, type Author, type Book } from '@/lib/metadata'
import { AuthorSidebar } from './author-sidebar'
import { BooksGrid } from './books-grid'
import { AuthorProfile } from './author-profile'

export function Bookshelf({ authors, author, books }: {
  authors: Author[]; author: Author; books: Book[]
}) {
  const { locale } = useLanguage()
  return <main className="w-full min-h-screen max-w-screen-2xl mx-auto p-4">
    <h1 className="text-xl font-semibold mb-4">{authorName(author, locale)}</h1>
    <div className="flex flex-col md:flex-row gap-4">
      <AuthorSidebar authors={authors} selectedAuthor={author.id} />
      <div className="flex-1 min-w-0 space-y-4">
        <AuthorProfile author={author} />
        <BooksGrid books={books} author={author} />
      </div>
    </div>
  </main>
}
