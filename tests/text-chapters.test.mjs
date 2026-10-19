import assert from 'node:assert/strict'
import { test } from 'node:test'
import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { runInNewContext } from 'node:vm'
import { createTextChapters, normalizeChapterInput } from '../lib/text-chapters.ts'

const worker = readFileSync(new URL('../public/vendor/treader-toc/worker.js', import.meta.url), 'utf8')
function detect(input) {
  const context = { input, result: null, console: { error() {} }, self: { addEventListener(name, listener) { this.listener = listener } } }
  context.postMessage = result => { context.result = result }
  runInNewContext(worker + '\nself.listener({ data: input });', context, { timeout: 2000 })
  return context.result
}
const prose = '飞船经过轨道，旅人望向群星，继续记录漫长旅途中的见闻。'.repeat(35)

test('combined recognition supports repeated Chinese, English and bare numeric headings', () => {
  for (const titles of [
    ['第一章 起点', '第二章 旅途', '第三章 星光', '第四章 归来'],
    ['Chapter I Departure', 'Chapter II Journey', 'Chapter III Stars', 'Chapter IV Home'],
    ['1', '2', '3', '4'],
    ['一', '二', '三', '四'],
    ['I', 'II', 'III', 'IV'],
  ]) {
    const content = titles.map(title => `${title}\n\n${prose}\n\n`).join('')
    const result = detect(content)
    if (titles[0].startsWith('第一章')) assert.ok(result?.items.length >= 4)
    assert.deepEqual(createTextChapters(content, result).map(item => item.title), titles)
  }
})

test('chapter anchors preserve original CRLF, indentation, emoji and text offsets', () => {
  const content = `书名 😀\r\n\r\n  第一章 起点  \r\n${prose}\r\n\r\n  第二章 回家\r\n${prose}`
  const normalized = normalizeChapterInput(content)
  const chapters = createTextChapters(content, { items: [
    { title: '第一章 起点', cursor: normalized.indexOf('  第一章') },
    { title: '第二章 回家', cursor: normalized.indexOf('  第二章') },
  ] })
  assert.equal(chapters.length, 2)
  assert.equal(chapters[0].start, content.indexOf('  第一章'))
  assert.equal(content.slice(chapters[0].start, chapters[0].end), '  第一章 起点  ')
  assert.equal(chapters[1].start, content.indexOf('  第二章'))
  let offset = 0
  const pieces = chapters.flatMap(chapter => {
    const parts = [content.slice(offset, chapter.start), content.slice(chapter.start, chapter.end)]
    offset = chapter.end
    return parts
  })
  assert.equal([...pieces, content.slice(offset)].join(''), content)
})

test('two explicit chapters use a conservative fallback when statistical detection has too little evidence', () => {
  const content = `前言\n${prose}\n第一章 起点\n${prose}\n第二章 终点\n${prose}\n后记\n原文保留。`
  assert.deepEqual(createTextChapters(content, null).map(item => item.title), ['前言', '第一章 起点', '第二章 终点', '后记'])
})

test('chapter references inside prose, dates, short lists and unstructured titles do not create invented chapters', () => {
  for (const content of [
    '他在第一章看到了答案。\n后来他又翻开第二章，继续阅读。',
    '第一章已经过去很久，他仍记得那句话。\n第二章讲述的往事也早已结束。',
    '2026年10月19日\n这是一篇日记。\n2026年10月20日\n继续记录。',
    '1. 苹果\n2. 香蕉\n3. 橘子',
    `晨曦\n${prose}\n归来\n${prose}`,
  ]) {
    assert.deepEqual(createTextChapters(content, null), [])
    assert.deepEqual(createTextChapters(content, detect(normalizeChapterInput(content))), [])
  }
})

test('a dense printed TOC is not duplicated in navigation when actual chapters repeat immediately after it', () => {
  const content = `目录\n第一章 起点\n第二章 旅途\n第三章 归来\n\n第一章 起点\n${prose}\n第二章 旅途\n${prose}\n第三章 归来\n${prose}`
  const chapters = createTextChapters(content, null)
  assert.deepEqual(chapters.map(item => item.title), ['第一章 起点', '第二章 旅途', '第三章 归来'])
  assert.equal(chapters[0].start, content.lastIndexOf('第一章 起点'))
})

test('Chinese numbered titles are separated from comma-style lists embedded in the narrative', () => {
  const content = `目录\n零  前奏\n一  远行\n二  归途\n\n零 前奏\n${prose}\n一 远行\n一、第一项任务。\n二、第二项任务。\n三、第三项任务。\n${prose}\n二 归途\n${prose}`
  assert.deepEqual(createTextChapters(content, null).map(item => item.title), ['零 前奏', '一 远行', '二 归途'])
})

test('volumes and chapters retain hierarchy, and Markdown headings retain their original markers', () => {
  const content = `第一卷 远航\n第一章 起点\n${prose}\n第二章 旅途\n${prose}\n第二卷 归家\n第三章 终点\n${prose}`
  assert.deepEqual(createTextChapters(content, null).map(item => item.level), [0, 1, 1, 0, 1])
  const markdown = '# 第一部分\n正文\n## 细节\n更多正文'
  assert.deepEqual(createTextChapters(markdown, null, 'md').map(item => [item.title, item.level]), [['# 第一部分', 0], ['## 细节', 1]])
})

test('malformed or stale worker offsets never become anchors in another text', () => {
  const content = `不带章节的正文\n${prose}`
  assert.deepEqual(createTextChapters(content, { items: [null, { title: '<script>', cursor: 0 }, { title: '正文', cursor: -1 }, { title: '正文', cursor: 2.5 }, { title: '正文', cursor: Infinity }] }), [])
})

test('reviewed boundaries separate glued titles from prose without changing text or losing long headings', () => {
  const short = '第二章  归途', long = '第三章　 终点'
  const content = `第一章 起点\r\n${prose}\r\n  ${short}这时他们返回了故乡。\r\n${prose}\r\n　　${long}旅人终于抵达远方。${prose}`
  const corrections = [
    { prefix: `${short}这时他们`, title: short },
    { prefix: `${long}旅人终于`, title: long },
  ]
  for (const detected of [null, detect(normalizeChapterInput(content))]) {
    const chapters = createTextChapters(content, detected, 'txt', corrections)
    assert.deepEqual(chapters.map(chapter => chapter.title), ['第一章 起点', short, long])
    assert.ok(content.slice(chapters[1].end).startsWith('这时他们'))
    assert.ok(content.slice(chapters[2].end).startsWith('旅人终于'))
    let offset = 0
    const pieces = chapters.flatMap(chapter => {
      const result = [content.slice(offset, chapter.start), content.slice(chapter.start, chapter.end)]
      offset = chapter.end
      return result
    })
    assert.equal([...pieces, content.slice(offset)].join(''), content)
  }
})

test('reviewed boundaries are ignored after the source changes or when a prefix is ambiguous', () => {
  const content = `第一章 起点\n${prose}\n第二章 归途\n${prose}`
  const correction = { prefix: '第二章 归途这时他们', title: '第二章 归途' }
  assert.deepEqual(createTextChapters(content, null, 'txt', [correction]), createTextChapters(content, null))
  const ambiguous = `${content}\n后记 旅程到此结束。\n\n后记 旅程到此结束。`
  const duplicate = { prefix: '后记 旅程到此结束', title: '后记' }
  assert.deepEqual(createTextChapters(ambiguous, null, 'txt', [duplicate]), createTextChapters(ambiguous, null))
})

test('the standalone detector retains its pinned unmodified source and MPL notice', () => {
  const provenance = JSON.parse(readFileSync(new URL('../public/vendor/treader-toc/provenance.json', import.meta.url)))
  assert.equal(provenance.revision, '282bcdcd6e60321d37306b5e6eadad4df6f89821')
  assert.equal(createHash('sha256').update(worker).digest('hex'), provenance.files[0].sha256)
  assert.match(worker, /Incompatible With Secondary Licenses/)
  assert.match(readFileSync(new URL('../public/vendor/treader-toc/LICENSE', import.meta.url), 'utf8'), /Mozilla Public License Version 2.0/)
})
