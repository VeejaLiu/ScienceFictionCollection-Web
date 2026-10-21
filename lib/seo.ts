import { absoluteUrl } from './site.ts'
import { authorHref, bookHref, authorBio, isPeriodical, type Author, type Book } from './metadata.ts'

export function personSchema(author: Author) {
  return { '@context': 'https://schema.org', '@type': isPeriodical(author) ? 'Periodical' : 'Person', name: author.name,
    ...(isPeriodical(author) ? { publisher: { '@type': 'Organization', name: author.publisher } } : {}),
    alternateName: [...new Set(Object.values(author.names))], url: absoluteUrl(authorHref(author)),
    ...(authorBio(author, 'zh-CN') ? { description: authorBio(author, 'zh-CN') } : {}),
    image: absoluteUrl(`/collection/${author.avatar}`) }
}

export function bookSchema(book: Book, author: Author) {
  if (isPeriodical(author)) return {
    '@context': 'https://schema.org', '@type': 'PublicationIssue', name: book.title,
    issueNumber: book.publication?.issueNumber, temporalCoverage: String(book.publication?.issueYear),
    inLanguage: book.language, url: absoluteUrl(bookHref(book)),
    isPartOf: { '@type': 'Periodical', name: author.name, url: absoluteUrl(authorHref(author)) },
    publisher: { '@type': 'Organization', name: author.publisher },
    ...(book.cover ? { image: absoluteUrl(`/collection/${book.cover}`) } : {}),
  }
  return { '@context': 'https://schema.org', '@type': 'Book', name: book.title,
    inLanguage: book.language, url: absoluteUrl(bookHref(book)),
    author: { '@type': 'Person', name: author.name, url: absoluteUrl(authorHref(author)) },
    ...(book.cover ? { image: absoluteUrl(`/collection/${book.cover}`) } : {}) }
}

export function safeJsonLd(value: unknown) { return JSON.stringify(value).replace(/</g, '\\u003c') }
