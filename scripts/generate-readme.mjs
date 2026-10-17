import { writeFileSync } from 'node:fs'
import { readCollection } from '../lib/collection.ts'
import { authorHref } from '../lib/metadata.ts'
import { absoluteUrl } from '../lib/site.ts'
import { loadProjectEnv } from './load-project-env.mjs'

loadProjectEnv()
const { authors } = readCollection()
const items = authors.map((author) => {
  const english = author.names.en
  const name = author.name + (english && english !== author.name ? ` · ${english}` : '')
  return `- [${name}](${absoluteUrl(authorHref(author))})`
})
const markdown = `# 科幻小说作品集

## 贡献者 Contributors

[![Contributors](https://contrib.rocks/image?repo=VeejaLiu/ScienceFictionCollection-Web)](https://github.com/VeejaLiu/ScienceFictionCollection-Web/graphs/contributors)

## 作者

${items.join('\n')}

## 更多

[在线阅读](${absoluteUrl('/')}) · [小说仓库](https://github.com/VeejaLiu/ScienceFictionCollection) · [项目与开发说明](docs/PROJECT.md) · [授权范围](LICENSE-SCOPE.md) · [发布状态](https://github.com/VeejaLiu/ScienceFictionCollection-Web/actions/workflows/pages.yml)
`
writeFileSync(new URL('../README.md', import.meta.url), markdown)
console.log('Updated README with contributors, authors and project links.')
