import type { GitHubFile } from './github'

/** Keep series folders in URLs and progress keys; root-level book keys stay unchanged. */
export function getBookPath(book: Pick<GitHubFile, 'name' | 'path'>, author: string) {
  const prefix = `${author}/`
  return book.path.startsWith(prefix) ? book.path.slice(prefix.length) : book.name
}

/** Only collection-relative author/book paths are accepted by the reader actions. */
export function isCollectionPath(path: string, allowRoot = false) {
  if (typeof path !== 'string') return false
  if (allowRoot && path === '') return true
  const segments = path.split('/')
  return /^\d{3} - .+/.test(segments[0]) && segments.every((part) =>
    part !== '' && part !== '.' && part !== '..' && !/[\\\0]/.test(part))
}
