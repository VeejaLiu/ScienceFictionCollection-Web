import { createServer } from 'node:http'
import { createReadStream, existsSync, readFileSync, statSync } from 'node:fs'
import { resolve, sep, extname } from 'node:path'

const root = resolve('out')
if (!existsSync(root)) throw new Error('Run pnpm build or pnpm build:pages first.')
const base = JSON.parse(readFileSync(resolve(root, 'build-info.json'), 'utf8')).basePath
const portIndex = process.argv.indexOf('--port')
const port = portIndex >= 0 ? Number(process.argv[portIndex + 1]) : 3000
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml' }
createServer((request, response) => {
  let path
  try { path = decodeURIComponent(new URL(request.url, 'http://localhost').pathname) } catch { response.writeHead(400).end(); return }
  if (base && path === '/') { response.writeHead(302, { Location: `${base}/` }).end(); return }
  if (base && path !== base && !path.startsWith(`${base}/`)) { response.writeHead(404).end(); return }
  let file = resolve(root, `.${path.slice(base.length) || '/'}`)
  if (file !== root && !file.startsWith(root + sep)) { response.writeHead(403).end(); return }
  if (existsSync(file) && statSync(file).isDirectory()) file = resolve(file, 'index.html')
  if (!existsSync(file) || !statSync(file).isFile()) { response.writeHead(404).end('Not found'); return }
  response.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream' })
  createReadStream(file).pipe(response)
}).listen(port, '127.0.0.1', () => console.log(`Static preview: http://127.0.0.1:${port}${base}/`))
