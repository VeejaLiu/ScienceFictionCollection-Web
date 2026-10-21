import assert from 'node:assert/strict'
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { resolve, join, sep } from 'node:path'
import { authorHref, bookHref } from '../lib/metadata.ts'
import { readCollection } from '../lib/collection.ts'
import { loadProjectEnv } from './load-project-env.mjs'
loadProjectEnv()

const root = resolve('out')
const { basePath, siteUrl } = JSON.parse(readFileSync(join(root, 'build-info.json'), 'utf8'))
assert.equal(typeof siteUrl, 'string', 'Rebuild the static export before checking it.')
const absolute = (path) => new URL(path.replace(/^\//, ''), siteUrl.replace(/\/?$/, '/')).href
const catalog = readCollection()
const pages = ['/', '/periodicals/', ...catalog.authors.map((a) => authorHref(a)), ...catalog.books.map((b) => bookHref(b))]
const titles = new Set()

for (const page of pages) {
  const html = readFileSync(join(root, decodeURIComponent(page), 'index.html'), 'utf8')
  assert.ok(html.includes('<h1'), `${page}: missing rendered heading`)
  assert.ok(html.includes(`rel="canonical" href="${absolute(page)}"`), `${page}: canonical`)
  const title = html.match(/<title>(.*?)<\/title>/s)?.[1]
  assert.ok(title && !titles.has(title), `${page}: missing or duplicate title`)
  titles.add(title)
  assert.match(html, /<meta name="description" content="[^"]+"/, `${page}: description`)
  if (page.startsWith('/books/')) {
    assert.ok(!html.includes('<article'), `${page}: novel body must not be preloaded`)
    const book = catalog.books.find((book) => bookHref(book) === page)
    const schemaType = book.contentType === 'periodical' ? 'PublicationIssue' : 'Book'
    assert.ok(html.includes('application/ld+json') && html.includes(`"@type":"${schemaType}"`), `${page}: publication schema`)
  }
  for (const match of html.matchAll(/<(?:a|img|script|link)\b[^>]*?\b(?:href|src)="(\/[^"]*)"/g)) {
    const url = new URL(match[1].replaceAll('&amp;', '&'), 'https://static.invalid')
    if (!url.pathname.startsWith(`${basePath}/`)) throw new Error(`${page}: missing Pages prefix in ${match[1]}`)
    const file = resolve(root, `.${decodeURIComponent(url.pathname.slice(basePath.length))}`)
    assert.ok(file === root || file.startsWith(root + sep), `${page}: path escape`)
    assert.ok(existsSync(file), `${page}: missing ${match[1]}`)
    if (statSync(file).isDirectory()) assert.ok(existsSync(join(file, 'index.html')), `${page}: missing index for ${match[1]}`)
  }
}

const visit = (directory) => {
  for (const name of readdirSync(directory)) {
    const path = join(directory, name)
    if (statSync(path).isDirectory()) visit(path)
    else assert.ok(!/\.(txt|md|epub|pdf)$/i.test(name), `Novel body bundled under collection/: ${name}`)
  }
}
visit(join(root, 'collection'))
const sitemap = readFileSync(join(root, 'sitemap.xml'), 'utf8')
const entries = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1])
assert.equal(entries.length, 2 + catalog.authors.length + catalog.books.filter((b) => b.size > 0).length)
for (const book of catalog.books.filter((b) => b.size === 0)) {
  assert.ok(!entries.includes(absolute(bookHref(book))))
  assert.match(readFileSync(join(root, 'books', book.slug, 'index.html'), 'utf8'), /noindex/)
}
assert.ok(existsSync(join(root, '.nojekyll')))
console.log(`Verified ${pages.length} HTML pages, ${entries.length} sitemap URLs and all local asset links; no novel bodies bundled.`)
