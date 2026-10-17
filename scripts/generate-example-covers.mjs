import { createRequire } from 'node:module'
import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { metadataDirectory } from '../lib/collection.ts'
import { loadProjectEnv } from './load-project-env.mjs'

const require = createRequire(import.meta.url)
const sharp = createRequire(require.resolve('next/package.json'))('sharp')
loadProjectEnv()
const target = resolve(metadataDirectory(), 'covers')
mkdirSync(target, { recursive: true })
for (const [slug, accent] of [
  ['three-body', '#efb35c'],
  ['dark-forest', '#82c4a8'],
  ['deaths-end', '#b4a0e5'],
]) {
  // Original geometric demo artwork; no publisher cover or third-party image.
  const stars = Array.from({ length: 42 }, (_, i) => `<circle cx="${(i * 137 + 43) % 560 + 20}" cy="${(i * 83 + 17) % 530 + 40}" r="${i % 3 + 1}" fill="#fff" opacity=".45"/>`).join('')
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="900" viewBox="0 0 600 900"><rect width="600" height="900" fill="#111c29"/>${stars}<g fill="none" stroke="${accent}" stroke-width="2" opacity=".6"><ellipse cx="300" cy="340" rx="205" ry="92" transform="rotate(-35 300 340)"/><ellipse cx="300" cy="340" rx="205" ry="92" transform="rotate(35 300 340)"/><circle cx="300" cy="340" r="130"/></g><circle cx="300" cy="340" r="35" fill="${accent}"/></svg>`
  writeFileSync(resolve(target, `${slug}.svg`), svg)
  await sharp(Buffer.from(svg)).webp({ quality: 78, effort: 6 }).toFile(resolve(target, `${slug}.webp`))
}
console.log('Generated three original geometric demo covers in the metadata directory.')
