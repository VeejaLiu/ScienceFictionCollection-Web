import { CONTENT_REPO_OWNER, CONTENT_REPO_NAME } from './site.ts'

export type Author = {
  id: string
  slug: string
  directory: string
  name: string
  names: Record<string, string>
  avatar: string
  bio?: Record<string, string>
  sources?: { label: string; url: string }[]
}

export type ChapterTitleCorrection = { prefix: string; title: string }

export type Book = {
  id: string
  slug: string
  authorId: string
  workId: string
  path: string
  title: string
  format: 'txt' | 'md' | 'epub' | 'pdf'
  size: number
  language: string
  series: string
  cover: string | null
  coverStyle?: 'full' | 'artwork'
  coverSource?: { label: string; url: string }
  chapterTitleCorrections?: ChapterTitleCorrection[]
}

export type Catalog = { schemaVersion: 1; authors: Author[]; books: Book[] }

function requireValue(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(`Invalid metadata: ${message}`)
}

export function isRelativePath(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0 && !value.includes('\\')
    && !value.includes('\0') && !value.includes('://')
    && value.split('/').every((part) => part !== '' && part !== '.' && part !== '..')
}

export function isSlug(value: unknown): value is string {
  return typeof value === 'string' && value === value.normalize('NFKC').toLowerCase()
    && /^[\p{L}\p{N}]+(?:-[\p{L}\p{N}]+)*$/u.test(value)
}

function isAsset(value: unknown, folder: string): value is string {
  return isRelativePath(value) && value.startsWith(`${folder}/`) && /\.webp$/i.test(value)
}

export function parseCatalog(authorDocument: unknown, bookDocuments: Record<string, unknown>): Catalog {
  const doc = authorDocument as { schemaVersion?: number; authors?: Author[] }
  requireValue(doc?.schemaVersion === 1 && Array.isArray(doc.authors) && doc.authors.length > 0, 'authors.json schemaVersion/authors')
  const ids = new Set<string>()
  const authorSlugs = new Set<string>()
  const bookSlugs = new Set<string>()
  const directories = new Set<string>()
  const bookIds = new Set<string>()
  const workAuthors = new Map<string, string>()
  const books: Book[] = []
  for (const author of doc.authors) {
    requireValue(author && typeof author === 'object', 'author record')
    requireValue(typeof author.id === 'string' && /^[a-z0-9][a-z0-9-]*$/.test(author.id) && !ids.has(author.id), 'unique author id')
    requireValue(isSlug(author.slug) && !authorSlugs.has(author.slug), `${author.id}: unique author slug`)
    authorSlugs.add(author.slug)
    requireValue(isRelativePath(author.directory) && !directories.has(author.directory), `${author.id}: unique directory`)
    requireValue(typeof author.name === 'string' && author.name.trim(), `${author.id}: name`)
    requireValue(author.names && typeof author.names === 'object' && !Array.isArray(author.names), `${author.id}: names`)
    requireValue(Object.values(author.names).every((name) => typeof name === 'string' && name.trim()), `${author.id}: localized names`)
    requireValue(isAsset(author.avatar, 'avatars'), `${author.id}: avatar`)
    requireValue(author.bio === undefined || (author.bio && typeof author.bio === 'object' && !Array.isArray(author.bio)
      && Object.values(author.bio).every((text) => typeof text === 'string' && text.trim())), `${author.id}: bio`)
    requireValue(author.sources === undefined || (Array.isArray(author.sources) && author.sources.every((source) =>
      source && typeof source.label === 'string' && source.label.trim() && typeof source.url === 'string'
      && URL.canParse(source.url) && new URL(source.url).protocol === 'https:')), `${author.id}: sources`)
    ids.add(author.id); directories.add(author.directory)
    const record = bookDocuments[author.id] as { schemaVersion?: number; authorId?: string; books?: Omit<Book, 'authorId'>[] }
    requireValue(record?.schemaVersion === 1 && record.authorId === author.id && Array.isArray(record.books), `${author.id}: book document`)
    const paths = new Set<string>()
    for (const book of record.books) {
      requireValue(book && typeof book === 'object', 'book record')
      requireValue(typeof book.id === 'string' && /^[a-z0-9][a-z0-9-]*$/.test(book.id) && !bookIds.has(book.id), 'unique book id')
      requireValue(typeof book.workId === 'string' && /^[a-z0-9][a-z0-9-]*$/.test(book.workId), `${book.id}: workId`)
      requireValue(!workAuthors.has(book.workId) || workAuthors.get(book.workId) === author.id, `${book.id}: work author`)
      workAuthors.set(book.workId, author.id)
      requireValue(isSlug(book.slug) && !bookSlugs.has(book.slug), `${book.id}: unique book slug`)
      bookSlugs.add(book.slug)
      requireValue(isRelativePath(book.path) && !paths.has(book.path), `${book.id}: unique relative path`)
      requireValue(['txt', 'md', 'epub', 'pdf'].includes(book.format) && book.path.toLowerCase().endsWith(`.${book.format}`), `${book.id}: format`)
      requireValue(typeof book.title === 'string' && book.title.trim(), `${book.id}: title`)
      requireValue(Number.isSafeInteger(book.size) && book.size >= 0, `${book.id}: size`)
      requireValue(typeof book.language === 'string' && book.language.length > 0, `${book.id}: language`)
      requireValue(typeof book.series === 'string', `${book.id}: series`)
      requireValue(book.cover === null || isAsset(book.cover, 'covers'), `${book.id}: cover`)
      requireValue(book.coverStyle === undefined || ['full', 'artwork'].includes(book.coverStyle), `${book.id}: coverStyle`)
      requireValue(book.coverSource === undefined || (book.coverSource && typeof book.coverSource.label === 'string'
        && book.coverSource.label.trim() && typeof book.coverSource.url === 'string' && URL.canParse(book.coverSource.url)
        && new URL(book.coverSource.url).protocol === 'https:'), `${book.id}: coverSource`)
      requireValue(book.chapterTitleCorrections === undefined || (['txt', 'md'].includes(book.format)
        && Array.isArray(book.chapterTitleCorrections) && book.chapterTitleCorrections.length <= 5000
        && book.chapterTitleCorrections.every((entry) => entry && typeof entry.prefix === 'string'
          && typeof entry.title === 'string' && entry.title.trim() === entry.title && entry.title.length > 0
          && entry.title.length <= 100 && entry.prefix.length <= 200 && entry.prefix.startsWith(entry.title)
          && !/[\r\n]/u.test(entry.prefix))), `${book.id}: chapterTitleCorrections`)
      bookIds.add(book.id); paths.add(book.path)
      books.push({ ...book, authorId: author.id })
    }
  }
  return { schemaVersion: 1, authors: doc.authors, books }
}

export function authorName(author: Author, locale: string) {
  return author.names[locale] || (locale.startsWith('zh') ? author.name : author.names.en) || author.name
}

export function authorBio(author: Author, locale: string) {
  return author.bio?.[locale] || author.bio?.[locale.startsWith('zh') ? 'zh-CN' : 'en'] || author.bio?.['zh-CN'] || ''
}

export function authorHref(author: Pick<Author, 'slug'>) { return `/authors/${encodeURIComponent(author.slug)}/` }
export function bookHref(book: Pick<Book, 'slug'>) { return `/books/${encodeURIComponent(book.slug)}/` }

export function rawBookUrl(author: Author, book: Book) {
  const path = `${author.directory}/${book.path}`.split('/').map(encodeURIComponent).join('/')
  return `https://raw.githubusercontent.com/${CONTENT_REPO_OWNER}/${CONTENT_REPO_NAME}/master/${path}`
}


// Static export may provide percent-encoded non-ASCII route parameters.
export function routeSlug(value: string) {
  try { return decodeURIComponent(value) } catch { return '' }
}
