import assert from 'node:assert/strict'
import { test } from 'node:test'
import { locales, messages, resolveLocale, translate } from '../lib/i18n.ts'
import { estimateReadingTime } from '../lib/reading-time.ts'

test('invalid or missing saved languages fall back to Simplified Chinese', () => {
  assert.equal(resolveLocale(), 'zh-CN')
  assert.equal(resolveLocale('invalid'), 'zh-CN')
  assert.equal(resolveLocale('fr'), 'fr')
  assert.equal(resolveLocale('zh-TW'), 'zh-TW')
})

test('all eight locales render complete interface messages without unresolved placeholders', () => {
  assert.equal(locales.length, 8)
  for (const locale of locales) {
    for (const key of Object.keys(messages['zh-CN'])) {
      const rendered = translate(locale, key, { current: 2, total: 10, title: 'Foundation', language: 'English', author: 'Isaac Asimov', count: 64, hours: 2, minutes: 5 })
      assert.ok(rendered.trim().length > 0, `${locale}.${key}`)
      assert.doesNotMatch(rendered, /\{\w+\}/, `${locale}.${key}`)
    }
  }
})

test('language changes preserve author names and localize reading-time boundaries', () => {
  assert.equal(translate('en', 'authorWorks', { author: '阿西莫夫', count: 64 }), '阿西莫夫 · 64 works')
  const en = (key, values) => translate('en', key, values)
  const fr = (key, values) => translate('fr', key, values)
  assert.equal(estimateReadingTime(0, en), 'About 1 min')
  assert.equal(estimateReadingTime(60 * 1200, en), 'About 1 hr')
  assert.equal(estimateReadingTime(61 * 1200, fr), 'Environ 1 h 1 min')
})
