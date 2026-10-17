import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)
export function loadProjectEnv() {
  createRequire(require.resolve('next/package.json'))('@next/env').loadEnvConfig(process.cwd())
}
