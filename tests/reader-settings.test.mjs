import assert from 'node:assert/strict'
import { test } from 'node:test'
import { parseReaderSettings, flattenContents, validEpubCfi } from '../lib/reader-settings.ts'

test('saved reading settings accept supported values and reject invalid display settings', () => {
  assert.deepEqual(parseReaderSettings({ fontSize: 24, lineHeight: 2.2 }), { fontSize: 24, lineHeight: 2.2 })
  assert.deepEqual(parseReaderSettings({ fontSize: 500, lineHeight: 'bad' }, { fontSize: 18, lineHeight: 1.9 }), { fontSize: 18, lineHeight: 1.9 })
  assert.deepEqual(parseReaderSettings(null), { fontSize: 20, lineHeight: 1.9 })
})

test('nested EPUB contents retain order, links and hierarchy', () => {
  assert.deepEqual(flattenContents([{ href: 'part.xhtml', label: ' Part ', subitems: [{ href: 'chapter.xhtml#one', label: 'Chapter' }] }]), [
    { href: 'part.xhtml', label: 'Part' }, { href: 'chapter.xhtml#one', label: '　Chapter' },
  ])
})

test('EPUB progress accepts position identifiers but not URLs or malformed saved data', () => {
  assert.equal(validEpubCfi('epubcfi(/6/4!/4/2/1:0)'), true)
  for (const invalid of [null, '', 'https://example.com/', 'javascript:alert(1)', 'epubcfi(', 'epubcfi(' + 'a'.repeat(9000) + ')']) assert.equal(validEpubCfi(invalid), false)
})
