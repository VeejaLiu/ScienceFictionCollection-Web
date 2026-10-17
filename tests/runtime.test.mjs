import assert from 'node:assert/strict'
import { test } from 'node:test'
import { readFileSync } from 'node:fs'
import { supportsNode, supportsPackageManager } from '../scripts/check-runtime.mjs'

test('runtime accepts patched Node 24 releases and rejects older or different major versions', () => {
  const pin = readFileSync(new URL('../.nvmrc', import.meta.url), 'utf8').trim()
  assert.equal(supportsNode(pin, pin), true)
  assert.equal(supportsNode('24.22.1', pin), true)
  assert.equal(supportsNode('24.23.0', pin), true)
  for (const version of ['22.13.1', '24.21.0', '25.0.0', '26.12.0', '24.invalid.0']) {
    assert.equal(supportsNode(version, pin), false, version)
  }
})

test('runtime rejects alternative package managers and unpinned pnpm versions', () => {
  const wanted = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')).packageManager
  assert.equal(supportsPackageManager('pnpm/9.15.2 npm/? node/v24.22.0 darwin x64', wanted), true)
  for (const agent of ['', 'npm/11.19.1 node/v24.22.0', 'pnpm/12.14.0 node/v24.22.0']) {
    assert.equal(supportsPackageManager(agent, wanted), false, agent)
  }
})
