import assert from 'node:assert/strict'
import { test } from 'node:test'
import { existsSync, readFileSync, readdirSync } from 'node:fs'

const read = (name) => readFileSync(new URL(`../${name}`, import.meta.url))

test('site icons have the intended formats and dimensions', () => {
  for (const [file, size] of [
    ['icon-light-32x32.png', 32], ['icon-dark-32x32.png', 32],
    ['icon.png', 256], ['apple-icon.png', 180],
  ]) {
    const png = read(`public/${file}`)
    assert.equal(png.subarray(1, 4).toString(), 'PNG')
    assert.equal(png.readUInt32BE(16), size)
    assert.equal(png.readUInt32BE(20), size)
  }
  const svg = read('public/icon.svg').toString()
  assert.match(svg, /BookOpen from lucide-react/)
  assert.doesNotMatch(svg, /<text|@font-face/)
})

test('removed font and unused placeholder files are absent from publishable sources', () => {
  const publicDir = new URL('../public/', import.meta.url)
  assert.equal(readdirSync(publicDir).some((name) => name.startsWith('placeholder')), false)
  assert.equal(existsSync(new URL('../fonts/AaGuDianKeBenSong-2.ttf', import.meta.url)), false)
  assert.doesNotMatch(read('app/layout.tsx').toString(), /next\/font|font-shanhai/)
})

test('published notices preserve copied component licenses, dependencies and pending upstream status', () => {
  const notices = read('public/third-party-notices.txt').toString()
  const inventory = JSON.parse(read('licenses/dependencies.json'))
  assert.match(notices, /Upstream application permission: pending/)
  assert.ok(notices.includes(read('licenses/shadcn-ui-LICENSE.txt').toString().trim()))
  assert.match(notices, /Cole Bemis/)
  for (const dependency of inventory) {
    assert.ok(dependency.notices.length > 0, dependency.name)
    assert.ok(notices.includes(`${dependency.name}@${dependency.version}`), dependency.name)
  }
  const packageJson = JSON.parse(read('package.json'))
  for (const name of Object.keys({ ...packageJson.dependencies, ...packageJson.devDependencies })) {
    assert.ok(inventory.some((entry) => entry.name === name), name)
  }
})
