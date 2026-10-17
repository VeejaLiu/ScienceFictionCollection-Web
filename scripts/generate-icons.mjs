import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { BookOpen } from 'lucide-react'
import { createRequire } from 'node:module'
import { mkdir, writeFile } from 'node:fs/promises'

// Reuse the SVG renderer supplied by the pinned Next.js dependency.
const require = createRequire(import.meta.url)
const sharp = createRequire(require.resolve('next/package.json'))('sharp')
const publicDir = new URL('../public/', import.meta.url)

function svg(dark = false, adaptive = false) {
  const book = renderToStaticMarkup(createElement(BookOpen, { size: 40, strokeWidth: 1.8 }))
  return `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
<!-- BookOpen from lucide-react (ISC / Feather MIT); see third-party-notices.txt. -->
<style>.bg{fill:${dark ? '#1c1917' : '#fffbeb'}}.book{color:${dark ? '#fef3c7' : '#292524'}}${adaptive ? '@media(prefers-color-scheme:dark){.bg{fill:#1c1917}.book{color:#fef3c7}}' : ''}</style>
<rect class="bg" width="64" height="64" rx="12"/>
<g class="book" transform="translate(12 12)">${book}</g>
</svg>\n`
}

await mkdir(publicDir, { recursive: true })
await writeFile(new URL('icon.svg', publicDir), svg(false, true))
for (const [name, size, dark] of [
  ['icon-light-32x32.png', 32, false], ['icon-dark-32x32.png', 32, true],
  ['icon.png', 256, false], ['apple-icon.png', 180, false],
]) {
  await sharp(Buffer.from(svg(dark))).resize(size, size).png().toFile(new URL(name, publicDir).pathname)
}
console.log('Generated SVG and four PNG icons from Lucide BookOpen.')
