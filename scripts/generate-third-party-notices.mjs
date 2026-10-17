import { existsSync, readFileSync, readdirSync, realpathSync, mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFileSync } from 'node:child_process'

const root = fileURLToPath(new URL('../', import.meta.url))
const store = join(root, 'node_modules/.pnpm')
if (!existsSync(store)) throw new Error('Install dependencies with pnpm before generating notices.')

const packages = new Map()
const installed = JSON.parse(execFileSync('pnpm', ['list', '--depth', 'Infinity', '--json'], {
  cwd: root, encoding: 'utf8', maxBuffer: 20 * 1024 * 1024, shell: process.platform === 'win32',
}))
const visited = new Set()
function visitDependencies(node) {
  for (const kind of ['dependencies', 'devDependencies', 'optionalDependencies']) {
    for (const dependency of Object.values(node[kind] || {})) {
      if (!dependency.path || !existsSync(join(dependency.path, 'package.json'))) continue
      const location = realpathSync(dependency.path)
      if (!visited.has(location)) {
        visited.add(location)
        const pkg = JSON.parse(readFileSync(join(location, 'package.json'), 'utf8'))
        if (pkg.name && pkg.version) packages.set(`${pkg.name}@${pkg.version}`, { pkg, location })
      }
      visitDependencies(dependency)
    }
  }
}
for (const project of installed) visitDependencies(project)

function noticeFiles(directory, prefix = '') {
  const files = []
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (entry.isSymbolicLink() || entry.name === 'node_modules' || entry.name === '.git') continue
    const path = join(directory, entry.name)
    const name = join(prefix, entry.name)
    if (entry.isDirectory()) files.push(...noticeFiles(path, name))
    else if (/^(license|licence|copying|notice|copyright)([._-]|$)/i.test(entry.name)
      && !/\.(js|ts|map|json|png|jpg|svg)$/i.test(entry.name)) files.push(name)
  }
  return files.sort()
}

const intro = `ScienceFictionCollection-Web — Third-party notices

Application source: https://github.com/VeejaLiu/ScienceFictionCollection-Web
Upstream application: https://github.com/BiscuitCoder/github_novel_read
Upstream application permission: pending confirmation in
https://github.com/BiscuitCoder/github_novel_read/issues/2
This notice file does not grant a license to the upstream application code.

The copied shadcn/ui components are covered by the shadcn MIT license below.
Site SVG/PNG icons are generated from Lucide BookOpen by scripts/generate-icons.mjs;
Lucide ISC and Feather MIT notices are reproduced below.
Typography uses fonts installed on the visitor's device. No font files are bundled.
Author portraits and literary works are outside this notice collection and have
not been cleared by the dependency licenses reproduced here.

This file is generated from installed packages, including their bundled license
files. It includes development/server tools and does not imply every listed
package is sent to the browser. Regenerate on the release platform after installing
the locked dependencies: pnpm licenses:generate.
Native image-processing components have additional source/relinking requirements
when distributing binaries; retain their README license tables and version lists.
See licenses/asset-sources.json and ASSET_NOTICES.txt for maintenance instructions.
`

const sections = [intro]
const inventory = []
function append(title, text) {
  sections.push(`\n${'='.repeat(78)}\n${title}\n${'='.repeat(78)}\n\n${text.trimEnd()}\n`)
}

append('shadcn/ui — MIT — https://github.com/shadcn-ui/ui/blob/main/LICENSE.md',
  readFileSync(join(root, 'licenses/shadcn-ui-LICENSE.txt'), 'utf8'))

for (const [id, { pkg, location }] of [...packages].sort(([a], [b]) => a.localeCompare(b))) {
  const repository = typeof pkg.repository === 'string' ? pkg.repository : pkg.repository?.url || pkg.homepage || ''
  const files = noticeFiles(location)
  const notices = files.map((name) => ({ path: name, text: readFileSync(join(location, name), 'utf8') }))
  // Some npm packages declare a license but omit its text. Retain the matching
  // repository/family license, and identify that provenance explicitly.
  if (notices.length === 0 && pkg.license === 'MIT') {
    let fallback
    if (pkg.name.startsWith('@next/')) fallback = 'nextjs-LICENSE.txt'
    else if (pkg.name.startsWith('@radix-ui/')) fallback = 'radix-ui-LICENSE.txt'
    else if (pkg.name.startsWith('embla-carousel')) fallback = 'embla-carousel-LICENSE.txt'
    else if (pkg.name === 'input-otp') fallback = 'input-otp-LICENSE.txt'
    else if (pkg.name === 'react-remove-scroll-bar') fallback = 'react-remove-scroll-bar-LICENSE.txt'
    else if (pkg.name === 'client-only' && pkg.version === '0.0.1') {
      fallback = 'react-LICENSE.txt'
      notices.push({ path: 'published package.json (MIT declaration; React homepage)', text: JSON.stringify(pkg, null, 2) })
    }
    if (fallback) notices.push({ path: `repository/family license: ${fallback}`, text: readFileSync(join(root, 'licenses', fallback), 'utf8') })
  }
  // The native libvips package ships its multi-library terms in README.md.
  if (pkg.name.startsWith('@img/sharp-libvips-')) {
    notices.push({ path: 'README.md', text: readFileSync(join(location, 'README.md'), 'utf8') })
    notices.push({ path: 'versions.json', text: readFileSync(join(location, 'versions.json'), 'utf8') })
    notices.push({ path: 'upstream LICENSE', text: readFileSync(join(root, 'licenses/sharp-libvips-LICENSE.txt'), 'utf8') })
  }
  if (!pkg.license || notices.length === 0) throw new Error(`License evidence missing for ${id}`)
  inventory.push({ name: pkg.name, version: pkg.version, license: pkg.license, repository, notices: notices.map(({ path }) => path) })
  append(`${id}\nDeclared license: ${typeof pkg.license === 'string' ? pkg.license : JSON.stringify(pkg.license)}\nSource: ${repository}`,
    notices.map(({ path, text }) => `--- ${path.replaceAll('\\', '/')} ---\n${text}`).join('\n\n'))
}

mkdirSync(join(root, 'public'), { recursive: true })
mkdirSync(join(root, 'licenses'), { recursive: true })
writeFileSync(join(root, 'public/third-party-notices.txt'), sections.join('\n'))
writeFileSync(join(root, 'licenses/dependencies.json'), JSON.stringify(inventory, null, 2) + '\n')
console.log(`Generated notices for ${inventory.length} installed packages plus shadcn/ui.`)
