import type { MetadataRoute } from 'next'
import { readCollection } from '@/lib/collection'
import { authorHref, bookHref } from '@/lib/metadata'
import { absoluteUrl } from '@/lib/site'

export const dynamic = 'force-static'
export default function sitemap(): MetadataRoute.Sitemap {
  const catalog = readCollection()
  return [
    { url: absoluteUrl('/') },
    { url: absoluteUrl('/periodicals/') },
    ...catalog.authors.map((author) => ({ url: absoluteUrl(authorHref(author)) })),
    ...catalog.books.filter((book) => book.size > 0).map((book) => ({ url: absoluteUrl(bookHref(book)) })),
  ]
}
