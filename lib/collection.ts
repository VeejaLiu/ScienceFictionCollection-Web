import { readFileSync, realpathSync, existsSync } from 'node:fs'
import { resolve, sep } from 'node:path'
import { parseCatalog, type Catalog } from './metadata.ts'

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
    documents[author.id] = JSON.parse(readFileSync(resolve(directory, 'books', `${author.id}.json`), 'utf8'))
  }
  const catalog = parseCatalog(authors, documents)
  for (const author of catalog.authors) metadataAsset(directory, author.avatar)
  for (const book of catalog.books) if (book.cover) metadataAsset(directory, book.cover)
  return catalog
}
