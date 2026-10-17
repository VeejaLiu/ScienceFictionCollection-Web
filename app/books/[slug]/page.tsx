import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { BookReader } from '@/components/bookshelf/book-reader'
import { readCollection } from '@/lib/collection'
import { routeSlug, bookHref, authorHref } from '@/lib/metadata'
import { absoluteUrl } from '@/lib/site'
import { bookSchema, safeJsonLd } from '@/lib/seo'

export const dynamicParams = false
export function generateStaticParams() { return readCollection().books.map(({ slug }) => ({ slug })) }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug: parameter } = await params
  const slug = routeSlug(parameter)
  const catalog = readCollection()
  const book = catalog.books.find((book) => book.slug === slug)
  if (!book) return {}
  const author = catalog.authors.find((author) => author.id === book.authorId)!
  const title = `${book.title}（${book.format.toUpperCase()}） - ${author.name}`
  const description = `${author.name}《${book.title}》的作品信息${book.series ? `，所属系列：${book.series}` : ''}。${['txt', 'md'].includes(book.format) ? '可按需加载正文在线阅读。' : `提供 ${book.format.toUpperCase()} 原始文件链接。`}`
  return { title, description, authors: [{ name: author.name, url: absoluteUrl(authorHref(author)) }],
    alternates: { canonical: absoluteUrl(bookHref(book)) },
    robots: book.size ? { index: true, follow: true } : { index: false, follow: true },
    openGraph: { title, description, url: absoluteUrl(bookHref(book)), type: 'book',
      ...(book.cover ? { images: [absoluteUrl(`/collection/${book.cover}`)] } : {}) } }
}

export default async function BookPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug: parameter } = await params
  const slug = routeSlug(parameter)
  const catalog = readCollection()
  const book = catalog.books.find((book) => book.slug === slug)
  if (!book) notFound()
  const author = catalog.authors.find((author) => author.id === book.authorId)!
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(bookSchema(book, author)) }} />
    <BookReader key={book.id} book={book} author={author} versions={catalog.books.filter((version) => version.workId === book.workId)} />
  </>
}
