import assert from 'node:assert/strict'
import { test } from 'node:test'
import { parseReaderSettings, defaultReaderSettings, flattenContents, validEpubCfi } from '../lib/reader-settings.ts'

test('saved reading settings accept supported values and reject invalid display settings', () => {
  assert.deepEqual(parseReaderSettings({ fontSize: 24, lineHeight: 2.2 }), { ...defaultReaderSettings, fontSize: 24, lineHeight: 2.2 })
  assert.deepEqual(parseReaderSettings({ fontSize: 500, lineHeight: 'bad' }, { fontSize: 18, lineHeight: 1.9 }), { ...defaultReaderSettings, fontSize: 18, lineHeight: 1.9 })
  assert.deepEqual(parseReaderSettings(null), defaultReaderSettings)
})

test('all typography preferences survive storage while stale or free-form CSS values are rejected', () => {
  const settings = { fontSize: 28, lineHeight: 2.2, width: 'wide', font: 'sans', palette: 'dark', paragraphSpacing: 1.2, fontWeight: 600, indent: 'two', alignment: 'start', letterSpacing: 0.08 }
  assert.deepEqual(parseReaderSettings(JSON.parse(JSON.stringify(settings))), settings)
  assert.deepEqual(parseReaderSettings({ fontSize: NaN, lineHeight: Infinity, width: 'huge', font: 'url(remote)', palette: '#000', paragraphSpacing: -3, fontWeight: 1000, indent: 2, alignment: 'center', letterSpacing: '1px' }), defaultReaderSettings)
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
