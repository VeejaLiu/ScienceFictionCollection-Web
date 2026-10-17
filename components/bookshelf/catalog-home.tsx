import { type Author, type Book } from '@/lib/metadata'
import { Bookshelf } from './index'

export function CatalogHome({ authors, books }: { authors: Author[]; books: Book[] }) {
  const author = authors[0]
  return <Bookshelf authors={authors} author={author} books={books.filter((book) => book.authorId === author.id)} />
}
