import { readFileSync, realpathSync, existsSync } from 'node:fs'
import { resolve, sep } from 'node:path'
import { parseCatalog, isRelativePath, type Catalog } from './metadata.ts'

export function metadataDirectory() {
  return resolve(process.env.COLLECTION_METADATA_DIR || resolve(process.cwd(), '../ScienceFictionCollection/metadata'))
}

export function metadataAsset(directory: string, path: string) {
  const root = realpathSync(directory)
  const target = realpathSync(resolve(root, path))
  if (!target.startsWith(root + sep)) throw new Error(`Metadata asset escapes directory: ${path}`)
  return target
}

/** Read JSON metadata only. Never open or scan novel bodies during a build. */
export function readCollection(directory = metadataDirectory()): Catalog {
  const manifest = resolve(directory, 'authors.json')
  if (!existsSync(manifest)) throw new Error(`Missing ${manifest}. Set COLLECTION_METADATA_DIR to the collection metadata directory.`)
  const authors = JSON.parse(readFileSync(manifest, 'utf8'))
  const documents: Record<string, unknown> = {}
  if (!Array.isArray(authors.authors)) throw new Error('Invalid metadata authors list')
  for (const author of authors.authors) {
    if (!/^[a-z0-9][a-z0-9-]*$/.test(author.id)) throw new Error('Invalid author id')
    if (!isRelativePath(author.booksFile) || !author.booksFile.startsWith('books/') || !author.booksFile.endsWith('.json')) {
      throw new Error('Invalid author book manifest')
    }
    documents[author.id] = JSON.parse(readFileSync(metadataAsset(directory, author.booksFile), 'utf8'))
  }
  const periodicalsPath = resolve(directory, 'periodicals.json')
  const periodicals = existsSync(periodicalsPath) ? JSON.parse(readFileSync(periodicalsPath, 'utf8')) : { schemaVersion: 1, periodicals: [] }
  if (periodicals.schemaVersion !== 1 || !Array.isArray(periodicals.periodicals)) throw new Error('Invalid periodicals registry')
  for (const periodical of periodicals.periodicals) {
    if (!isRelativePath(periodical.issuesFile) || !periodical.issuesFile.startsWith('issues/') || !periodical.issuesFile.endsWith('.json')) {
      throw new Error('Invalid periodical issue manifest')
    }
    const issues = JSON.parse(readFileSync(metadataAsset(directory, periodical.issuesFile), 'utf8'))
    if (issues.schemaVersion !== 1 || issues.periodicalId !== periodical.id || !Array.isArray(issues.issues) || documents[periodical.id]) {
      throw new Error('Invalid or duplicate periodical manifest')
    }
    documents[periodical.id] = { schemaVersion: 1, authorId: periodical.id, books: issues.issues }
  }
  // Reader ownership IDs remain stable; author and periodical catalogs live in separate source files.
  const catalog = parseCatalog({ ...authors, authors: [...authors.authors, ...periodicals.periodicals] }, documents)
  for (const author of catalog.authors) metadataAsset(directory, author.avatar)
  for (const book of catalog.books) if (book.cover) metadataAsset(directory, book.cover)
  return catalog
}
