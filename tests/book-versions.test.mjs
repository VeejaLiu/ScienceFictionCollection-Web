import assert from 'node:assert/strict'
import { test } from 'node:test'
import { booksForLocale, readingVersion, languageVersions, contentLanguage } from '../lib/book-versions.ts'

const edition = (id, language, format = 'txt', workId = 'work-a') => ({ id, slug: id, workId, language, format })
const zh = edition('chinese', 'zh-CN')
const en = edition('english', 'en')
const fr = edition('french', 'fr')

test('prefer the requested language, then English, then an available remaining language', () => {
  assert.deepEqual(languageVersions([zh, en, fr], 'fr'), [fr])
  assert.deepEqual(languageVersions([zh, en, fr], 'ja'), [en])
  assert.deepEqual(languageVersions([zh], 'en'), [zh])
  assert.deepEqual(languageVersions([fr], 'ru'), [fr])
  assert.deepEqual(languageVersions([zh, fr], 'ja'), [zh])
  assert.deepEqual(languageVersions([], 'en'), [])
})

test('choose editions separately for each work without borrowing another book’s English text', () => {
  const other = edition('other-french', 'fr', 'txt', 'work-b')
  assert.deepEqual(booksForLocale([zh, en, other], 'ja'), [en, other])
  assert.equal(readingVersion(zh, [zh, other], 'en')?.id, 'chinese')
})

test('formats of one language stay available and reading prefers the same format', () => {
  const epub = edition('chinese-epub', 'zh-CN', 'epub')
  const englishEpub = edition('english-epub', 'en', 'epub')
  assert.deepEqual(languageVersions([zh, epub], 'fr'), [zh, epub])
  assert.equal(readingVersion(epub, [zh, epub, en, englishEpub], 'en')?.id, 'english-epub')
  assert.equal(readingVersion(zh, [zh, epub], 'en')?.id, 'chinese')
})

test('distinguish Chinese scripts and match regional variants of other languages', () => {
  const hant = edition('traditional', 'zh-Hant')
  assert.equal(contentLanguage('zh-HK'), 'zh-TW')
  assert.equal(contentLanguage('zh-Hans'), 'zh-CN')
  assert.equal(contentLanguage('en-GB'), 'en')
  assert.deepEqual(languageVersions([zh, hant, en], 'zh-TW'), [hant])
  assert.deepEqual(languageVersions([en, fr], 'en-US'), [en])
})


test('a direct same-language file link keeps its format; explicit foreign-language selection is honored', () => {
  const epub = edition('chinese-epub', 'zh-CN', 'epub')
  assert.equal(readingVersion(epub, [zh, epub], 'zh-CN', zh.id)?.id, epub.id)
  assert.equal(readingVersion(fr, [zh, en, fr], 'zh-CN', fr.id)?.id, fr.id)
  assert.equal(readingVersion(fr, [zh, en, fr], 'en')?.id, en.id)
})
