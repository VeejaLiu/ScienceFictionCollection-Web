import assert from 'node:assert/strict'
import { test } from 'node:test'
import { fetchAuthorBooks, fetchRepoContents } from '../lib/github.ts'
import { getBookPath, isCollectionPath } from '../lib/book-path.ts'
import { getStorageKey } from '../lib/reading-progress.ts'

const author = '003 - Isaac Asimov(艾萨克·阿西莫夫)'
const entry = (path, type = 'file') => ({ name: path.split('/').at(-1), path, type })

test('collection actions accept nested book paths but reject URLs and path escapes', () => {
  assert.equal(isCollectionPath('', true), true)
  assert.equal(isCollectionPath(''), false)
  assert.equal(isCollectionPath(`${author}/基地系列/1-基地三部曲/基地.txt`), true)
  assert.equal(isCollectionPath('009 - Michael Swanwick (迈克尔·斯万维克) /书名 #1.txt'), true)
  for (const path of ['https://github.com/other/repo', '../other/repo', `${author}/../other`, `${author}//book.txt`, `${author}\\book.txt`, null]) {
    assert.equal(isCollectionPath(path), false, String(path))
  }
})

test('collects works through multiple series levels without losing root books', async (t) => {
  const directories = {
    [author]: [
      entry(`${author}/基地系列`, 'dir'),
      entry(`${author}/机器人系列`, 'dir'),
      entry(`${author}/银河帝国系列`, 'dir'),
      entry(`${author}/空系列`, 'dir'),
      entry(`${author}/最后的问题.txt`),
      entry(`${author}/0-汇总.md`),
      entry(`${author}/cover.png`),
    ],
    [`${author}/基地系列`]: [entry(`${author}/基地系列/1-基地三部曲`, 'dir')],
    [`${author}/基地系列/1-基地三部曲`]: [entry(`${author}/基地系列/1-基地三部曲/基地.txt`)],
    [`${author}/机器人系列`]: [entry(`${author}/机器人系列/钢穴.TXT`)],
    [`${author}/银河帝国系列`]: [entry(`${author}/银河帝国系列/星空暗流.txt`)],
    [`${author}/空系列`]: [],
  }
  const visited = []
  t.mock.method(globalThis, 'fetch', async (url) => {
    const path = decodeURIComponent(new URL(url).pathname.split('/contents/')[1])
    assert.ok(Object.hasOwn(directories, path), `Unexpected directory: ${path}`)
    visited.push(path)
    return { ok: true, json: async () => directories[path] }
  })
  const books = await fetchAuthorBooks('owner', 'repo', author)
  assert.deepEqual(books.map((book) => book.path).sort(), [
    `${author}/基地系列/1-基地三部曲/基地.txt`,
    `${author}/机器人系列/钢穴.TXT`,
    `${author}/银河帝国系列/星空暗流.txt`,
    `${author}/最后的问题.txt`,
    `${author}/0-汇总.md`,
  ].sort())
  assert.equal(visited.length, Object.keys(directories).length)
})

test('reports nested directory failures instead of silently showing an incomplete shelf', async (t) => {
  t.mock.method(globalThis, 'fetch', async (url) => {
    if (decodeURIComponent(url).endsWith(`/contents/${author}`)) {
      return { ok: true, json: async () => [entry(`${author}/基地系列`, 'dir')] }
    }
    return { ok: false, statusText: 'Forbidden' }
  })
  await assert.rejects(fetchAuthorBooks('owner', 'repo', author), /Forbidden/)
})

test('encodes Chinese, spaces and URL punctuation in every path segment', async (t) => {
  const path = `${author}/系列 #1/书名? &续篇.txt`
  t.mock.method(globalThis, 'fetch', async (url) => {
    assert.equal(new URL(url).hash, '')
    assert.equal(new URL(url).search, '')
    assert.equal(decodeURIComponent(new URL(url).pathname.split('/contents/')[1]), path)
    return { ok: true, json: async () => entry(path) }
  })
  assert.equal((await fetchRepoContents('owner', 'repo', path)).path, path)
})

test('reading URLs retain all series folders, and top-level links stay compatible', () => {
  const nested = entry(`${author}/基地系列/1-基地三部曲/基地.txt`)
  const relative = getBookPath(nested, author)
  const params = new URLSearchParams({ author, name: relative })
  const decoded = new URLSearchParams(params.toString())
  assert.equal(`${decoded.get('author')}/${decoded.get('name')}`, nested.path)
  assert.equal(getBookPath(entry(`${author}/最后的问题.txt`), author), '最后的问题.txt')
})

test('same-named works in different folders keep separate progress, preserving existing root keys', () => {
  const first = entry(`${author}/系列甲/同名.txt`)
  const second = entry(`${author}/系列乙/同名.txt`)
  assert.notEqual(
    getStorageKey('', author, getBookPath(first, author)),
    getStorageKey('', author, getBookPath(second, author)),
  )
  const root = entry(`${author}/最后的问题.txt`)
  assert.equal(getStorageKey('', author, getBookPath(root, author)), getStorageKey('', author, root.name))
})
