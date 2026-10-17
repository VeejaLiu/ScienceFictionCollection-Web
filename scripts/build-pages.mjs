import { spawnSync } from 'node:child_process'
import { loadProjectEnv } from './load-project-env.mjs'
loadProjectEnv()
const result = spawnSync('pnpm', ['build'], {
  stdio: 'inherit', shell: process.platform === 'win32',
  env: { ...process.env, NEXT_PUBLIC_BASE_PATH: '/ScienceFictionCollection-Web',
    SITE_URL: process.env.SITE_URL || 'https://veejaliu.github.io/ScienceFictionCollection-Web/' },
})
process.exit(result.status ?? 1)
