import { writeFileSync } from 'node:fs'
writeFileSync('out/.nojekyll', '')
writeFileSync('out/build-info.json', JSON.stringify({ basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',
  siteUrl: process.env.SITE_URL || 'https://veejaliu.github.io/ScienceFictionCollection-Web/' }))
console.log('Static export ready in out/ (metadata and UI only; no novel bodies bundled).')
