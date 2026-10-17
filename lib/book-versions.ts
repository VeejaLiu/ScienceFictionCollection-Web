import type { Book } from './metadata.ts'

/** Content language grouping; this never translates or relabels a novel. */
export function contentLanguage(tag: string) {
  try {
    const locale = new Intl.Locale(tag)
    if (locale.language === 'zh') return locale.maximize().script === 'Hant' ? 'zh-TW' : 'zh-CN'
    return locale.language
  } catch { return null }
}

export function languageVersions(versions: Book[], locale: string) {
  const requested = contentLanguage(locale)
  const direct = versions.filter((book) => requested !== null && contentLanguage(book.language) === requested)
  if (direct.length) return direct
  const english = versions.filter((book) => contentLanguage(book.language) === 'en')
  if (english.length) return english
  const first = versions.find((book) => contentLanguage(book.language) !== null)
  return first ? versions.filter((book) => contentLanguage(book.language) === contentLanguage(first.language)) : []
}

export function booksForLocale(books: Book[], locale: string) {
  const works = new Map<string, Book[]>()
  for (const book of books) {
    const versions = works.get(book.workId) || []
    versions.push(book); works.set(book.workId, versions)
  }
  return [...works.values()].flatMap((versions) => {
    const selected = preferredVersion(versions, locale)
    return selected ? [selected] : []
  })
}

export function readingVersion(book: Book, versions: Book[], locale: string) {
  const choices = languageVersions(versions.filter((candidate) => candidate.workId === book.workId), locale)
  return choices.find((candidate) => candidate.id === book.id)
    || choices.find((candidate) => candidate.format === book.format)
    || choices.find((candidate) => candidate.format === 'txt')
    || choices.find((candidate) => candidate.format === 'md')
    || choices[0] || null
}


export function preferredVersion(versions: Book[], locale: string) {
  const choices = languageVersions(versions, locale)
  return choices.find((book) => book.format === 'txt') || choices.find((book) => book.format === 'md') || choices[0] || null
}
