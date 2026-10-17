import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { Bookshelf } from '@/components/bookshelf'
import { readCollection } from '@/lib/collection'
import { routeSlug, authorHref, authorBio } from '@/lib/metadata'
import { absoluteUrl } from '@/lib/site'
import { personSchema, safeJsonLd } from '@/lib/seo'

export const dynamicParams = false
export function generateStaticParams() { return readCollection().authors.map(({ slug }) => ({ slug })) }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug: parameter } = await params
  const slug = routeSlug(parameter)
  const author = readCollection().authors.find((author) => author.slug === slug)
  if (!author) return {}
  const title = `${author.name}作品集`
  const description = authorBio(author, 'zh-CN') || `${author.name}的科幻作品目录，按系列浏览作品、查看封面并在线阅读。`
  return { title, description, alternates: { canonical: absoluteUrl(authorHref(author)) },
    openGraph: { title, description, url: absoluteUrl(authorHref(author)), type: 'website', images: [absoluteUrl(`/collection/${author.avatar}`)] } }
}

export default async function AuthorPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug: parameter } = await params
  const slug = routeSlug(parameter)
  const catalog = readCollection()
  const author = catalog.authors.find((author) => author.slug === slug)
  if (!author) notFound()
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(personSchema(author)) }} />
    <Bookshelf authors={catalog.authors} author={author} books={catalog.books.filter((book) => book.authorId === author.id)} />
  </>
}
