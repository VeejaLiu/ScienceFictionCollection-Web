import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = new URL('../', import.meta.url)

export function supportsNode(actual, pinned) {
  const current = actual.replace(/^v/, '').split('.').map(Number)
  const minimum = pinned.trim().split('.').map(Number)
  return current.length === 3 && current.every(Number.isInteger)
    && current[0] === minimum[0]
    && (current[1] > minimum[1] || (current[1] === minimum[1] && current[2] >= minimum[2]))
}

export function supportsPackageManager(userAgent, wanted) {
  const [name, version] = wanted.split('@')
  return userAgent.split(' ')[0] === `${name}/${version}`
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const pinned = readFileSync(new URL('.nvmrc', root), 'utf8').trim()
  const pkg = JSON.parse(readFileSync(new URL('package.json', root), 'utf8'))
  if (!supportsNode(process.versions.node, pinned)) {
    console.error(`需要 Node.js >=${pinned} 且 <25；当前为 ${process.version}。请先执行 nvm install && nvm use。`)
    process.exit(1)
  }
  const userAgent = process.env.npm_config_user_agent || ''
  if ((userAgent || process.argv.includes('--install')) && !supportsPackageManager(userAgent, pkg.packageManager)) {
    console.error(`请使用 ${pkg.packageManager}。可通过 corepack pnpm 或 npx pnpm@9.15.2 运行项目命令。`)
    process.exit(1)
  }
}
