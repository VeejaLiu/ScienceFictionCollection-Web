import { absoluteUrl } from './site.ts'
import { authorHref, bookHref, authorBio, type Author, type Book } from './metadata.ts'

export function personSchema(author: Author) {
  return { '@context': 'https://schema.org', '@type': 'Person', name: author.name,
    alternateName: [...new Set(Object.values(author.names))], url: absoluteUrl(authorHref(author)),
    ...(authorBio(author, 'zh-CN') ? { description: authorBio(author, 'zh-CN') } : {}),
    image: absoluteUrl(`/collection/${author.avatar}`) }
}

export function bookSchema(book: Book, author: Author) {
  return { '@context': 'https://schema.org', '@type': 'Book', name: book.title,
    inLanguage: book.language, url: absoluteUrl(bookHref(book)),
    author: { '@type': 'Person', name: author.name, url: absoluteUrl(authorHref(author)) },
    ...(book.cover ? { image: absoluteUrl(`/collection/${book.cover}`) } : {}) }
}

export function safeJsonLd(value: unknown) { return JSON.stringify(value).replace(/</g, '\\u003c') }
