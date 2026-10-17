import assert from 'node:assert/strict'
import { test } from 'node:test'
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { parseCatalog, authorName, rawBookUrl, isRelativePath, authorHref, bookHref, authorBio, isSlug, routeSlug } from '../lib/metadata.ts'
import { readCollection } from '../lib/collection.ts'
import { safeJsonLd, bookSchema } from '../lib/seo.ts'

const author = { id: '001', slug: 'test-writer', bio: { 'zh-CN': '作家简介', en: 'Writer biography' }, directory: '小说目录（未下载） ', name: '作家', names: { 'zh-CN': '作家', en: 'Writer', fr: 'Auteur' }, avatar: 'avatars/001.webp' }
const book = { id: '001-book', workId: '001-book', slug: '书名-1', path: '系列/书名 #1.txt', title: '书名', format: 'txt', size: 20000, language: 'zh-CN', series: '系列', cover: null }
const documents = () => [{ schemaVersion: 1, authors: [structuredClone(author)] }, { '001': { schemaVersion: 1, authorId: '001', books: [structuredClone(book)] } }]

test('catalog metadata binds author directories and nested works without inspecting novel bodies', () => {
  const directory = mkdtempSync(join(tmpdir(), 'collection-metadata-test-'))
  try {
    const [authors, books] = documents()
    mkdirSync(join(directory, 'books')); mkdirSync(join(directory, 'avatars'))
    writeFileSync(join(directory, 'authors.json'), JSON.stringify(authors))
    writeFileSync(join(directory, 'books/001.json'), JSON.stringify(books['001']))
    writeFileSync(join(directory, 'avatars/001.webp'), Buffer.from('image fixture'))
    // No author directory or novel exists in this fixture: only JSON and an image.
    const catalog = readCollection(directory)
    assert.equal(catalog.books[0].authorId, author.id)
    assert.equal(catalog.books[0].path, book.path)
  } finally { rmSync(directory, { recursive: true, force: true }) }
})

test('display names follow interface locale with explicit fallback', () => {
  assert.equal(authorName(author, 'fr'), 'Auteur')
  assert.equal(authorName(author, 'zh-CN'), '作家')
  assert.equal(authorName(author, 'ja'), 'Writer')
})

test('invalid asset paths, duplicate ids and mismatched author manifests are rejected', () => {
  for (const path of ['/etc/passwd', '../book', 'a/../b', 'https://example.com/a', 'a\\b']) assert.equal(isRelativePath(path), false)
  let [authors, books] = documents(); authors.authors[0].avatar = '../outside.png'
  assert.throws(() => parseCatalog(authors, books), /avatar/)
  ;[authors, books] = documents(); books['001'].books.push(structuredClone(book))
  assert.throws(() => parseCatalog(authors, books), /unique book id/)
  ;[authors, books] = documents(); books['001'].authorId = 'other'
  assert.throws(() => parseCatalog(authors, books), /book document/)
})

test('on-demand URLs preserve spaces and special characters inside the fixed repository', () => {
  const url = new URL(rawBookUrl(author, book))
  assert.equal(url.origin, 'https://raw.githubusercontent.com')
  assert.equal(url.hash, ''); assert.equal(url.search, '')
  assert.equal(decodeURIComponent(url.pathname), `/VeejaLiu/ScienceFictionCollection/master/${author.directory}/${book.path}`)
})

test('SEO schema uses metadata and escapes script-closing text', () => {
  const schema = bookSchema({ ...book, authorId: author.id }, author)
  assert.equal(schema['@type'], 'Book'); assert.equal(schema.name, book.title)
  assert.equal(schema.author.name, author.name)
  assert.ok(!safeJsonLd({ name: '</script><script>bad</script>' }).includes('<'))
})


test('public URLs use explicit readable slugs while file URLs and progress retain stable IDs', async () => {
  const { getStorageKey } = await import('../lib/reading-progress.ts')
  assert.equal(authorHref(author), '/authors/test-writer/')
  assert.equal(decodeURIComponent(bookHref(book)), '/books/书名-1/')
  const renamed = { ...book, title: '更正标题', slug: 'another-title' }
  assert.equal(rawBookUrl(author, renamed), rawBookUrl(author, book))
  assert.equal(getStorageKey('', author.id, renamed.id), getStorageKey('', author.id, book.id))
  assert.equal(authorBio(author, 'zh-TW'), '作家简介')
  assert.equal(authorBio(author, 'fr'), 'Writer biography')
})

test('catalog rejects ambiguous, unsafe or missing public slugs and unsafe biography links', () => {
  for (const slug of ['../writer', 'A-Writer', 'two--words', 'two_words', '', 'a/b', '%2F']) assert.equal(isSlug(slug), false)
  assert.equal(isSlug('三体-黑暗森林'), true)
  let [authors, books] = documents()
  delete authors.authors[0].slug
  assert.throws(() => parseCatalog(authors, books), /author slug/)
  ;[authors, books] = documents()
  books['001'].books.push({ ...book, id: 'different-id', path: 'other.txt' })
  assert.throws(() => parseCatalog(authors, books), /book slug/)
  ;[authors, books] = documents()
  authors.authors.push({ ...author, id: '002', directory: 'other' })
  assert.throws(() => parseCatalog(authors, books), /author slug/)
  ;[authors, books] = documents()
  authors.authors[0].sources = [{ label: 'Source', url: 'javascript:alert(1)' }]
  assert.throws(() => parseCatalog(authors, books), /sources/)
})


test('Chinese route parameters resolve both direct and static-export encoded slugs', () => {
  assert.equal(routeSlug('三体'), '三体')
  assert.equal(routeSlug(encodeURIComponent('三体')), '三体')
  assert.equal(routeSlug('liu-cixin'), 'liu-cixin')
  assert.equal(routeSlug('%broken'), '')
})
