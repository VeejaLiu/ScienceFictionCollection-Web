import { mkdirSync, copyFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { existsSync } from 'node:fs'
import { loadProjectEnv } from './load-project-env.mjs'
import { readCollection, metadataDirectory, metadataAsset } from '../lib/collection.ts'

loadProjectEnv()
const catalog = readCollection()
const directory = metadataDirectory()
const target = resolve('public/collection')
const files = new Set(['authors.json', ...(existsSync(resolve(directory, 'periodicals.json')) ? ['periodicals.json'] : []),
  ...catalog.authors.map((a) => a.kind === 'periodical' ? a.issuesFile : a.booksFile),
  ...catalog.authors.map((a) => a.avatar), ...catalog.books.flatMap((b) => b.cover ? [b.cover] : [])])
rmSync(target, { recursive: true, force: true })
for (const file of files) {
  const destination = resolve(target, file)
  mkdirSync(dirname(destination), { recursive: true })
  copyFileSync(metadataAsset(directory, file), destination)
}
writeFileSync(resolve(target, 'catalog.json'), JSON.stringify(catalog))
console.log(`Prepared ${catalog.authors.length} authors and ${catalog.books.length} works from metadata; no novel bodies read.`)
