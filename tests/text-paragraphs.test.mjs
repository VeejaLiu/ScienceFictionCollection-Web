import assert from 'node:assert/strict'
import { test } from 'node:test'
import { textParagraphs } from '../lib/text-paragraphs.ts'

test('hard-wrapped prose stays in one paragraph until a blank line', () => {
  const text = '  The ship crossed the quiet sky.\r\nThe journey continued through the night.\r\n\r\nThey finally reached home.'
  const result = textParagraphs(text)
  assert.equal(result.length, 2)
  assert.match(text.slice(result[0].start, result[0].end), /sky\.\r\nThe journey/)
  assert.equal(text.slice(result[0].start, result[0].indentEnd), '  ')
  assert.equal(text.slice(result[1].start, result[1].end), 'They finally reached home.')
})

test('indented Chinese paragraphs separate without requiring blank lines', () => {
  const text = '　　飞船出发了。\n　　“我们会回来的。”\n旅人这样说。\r\n  星光渐渐远去。'
  const result = textParagraphs(text)
  assert.equal(result.length, 3)
  assert.equal(text.slice(result[1].start, result[1].end), '　　“我们会回来的。”\n旅人这样说。')
  assert.equal(text.slice(result[2].start, result[2].indentEnd), '  ')
})

test('paragraph offsets retain every original character including mixed newlines and whitespace', () => {
  const text = '\r\n  \r\n　　星空 😀。\r\n\r\n\t \n  Next stop.\nContinuation.\r\n\r'
  let offset = 0
  const pieces = textParagraphs(text).flatMap(paragraph => {
    const parts = [text.slice(offset, paragraph.start), text.slice(paragraph.start, paragraph.indentEnd), text.slice(paragraph.indentEnd, paragraph.end)]
    offset = paragraph.end
    return parts
  })
  assert.equal([...pieces, text.slice(offset)].join(''), text)
  assert.deepEqual(textParagraphs(' \r\n\n　\r'), [])
})
