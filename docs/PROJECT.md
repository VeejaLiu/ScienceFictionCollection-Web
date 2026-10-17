[返回仓库首页](../README.md) · [小说与元信息仓库](https://github.com/VeejaLiu/ScienceFictionCollection)

# 阅读器说明与开发指南

[ScienceFictionCollection](https://github.com/VeejaLiu/ScienceFictionCollection) 的配套在线阅读网站，由 VeejaLiu 独立维护。

**[在线阅读](https://veejaliu.github.io/ScienceFictionCollection-Web/)** · **[小说与元信息仓库](https://github.com/VeejaLiu/ScienceFictionCollection)** · **[发布状态](https://github.com/VeejaLiu/ScienceFictionCollection-Web/actions/workflows/pages.yml)**

| 仓库 | 负责内容 |
| --- | --- |
| [ScienceFictionCollection](https://github.com/VeejaLiu/ScienceFictionCollection) | 小说原文、作者资料、作品语言版本、头像与封面 |
| [ScienceFictionCollection-Web](https://github.com/VeejaLiu/ScienceFictionCollection-Web)（本仓库） | 阅读体验、界面语言、版本选择、SEO 与网站发布 |

本仓库负责阅读器应用，小说正文继续存放在内容仓库的作者、系列目录中。目录、姓名、头像和封面统一由内容仓库的 `metadata/` 维护。站点只使用这份元信息，不提供切换其他仓库的入口。

## 功能

- metadata 通过 `directory` 和 `path` 明确绑定作者目录、系列目录及作品文件，网页通过可读 slug 链接，内部关联仍使用稳定 ID。
- 首页直接展示默认作者的作品，左侧切换作者；作品支持书架和列表两种视图，并在浏览器内记住选择。
- 作者头像、默认姓名、多语言姓名、简短介绍与作品封面由内容仓库统一维护。当前登记 13 位作者、210 组作品和 211 个作品文件，已为 61 条文件记录整理封面（其中 6 张来自对应 EPUB）；头像最长边 160 像素、封面不超过 600 × 900 像素，统一保存为 WebP。封面可使用对应 EPUB 的内嵌图片或已核对的出版参考封面，出处与版本说明由 metadata 记录；未核实的作品使用生成式封面。
- 简体中文、繁体中文、英文、法语、德语、俄语、日语、韩语界面；作者名称按 metadata 对应语言显示。第一版已录入简中、繁中、英文姓名，其他名称可继续补充。
- 目录只加载元信息；打开某本书后，浏览器自动请求这一本 TXT/Markdown 正文并恢复阅读进度，无需再次点击。EPUB 在页面内加载并支持目录、翻页和位置恢复；PDF 提供原始文件链接。
- 通过稳定作者 id 和作品 id 保存当前浏览器的阅读进度；不提供账号或跨设备同步。
- 纯静态导出，适配 GitHub Pages 项目站；构建不读取、下载或打包小说正文。EPUB 阅读库仅在打开 EPUB 时加载。

## SEO 与静态页面

首页、作者页 `/authors/<slug>/` 和作品页 `/books/<slug>/` 都在构建时生成真实 HTML，包含名称、目录链接、封面及作品详情。搜索引擎无需等待浏览器获取元信息。

同一作品的多语言正文通过 metadata 中的 `workId` 关联；每个实际文件保留独立 ID、slug 和语言标记。目录和阅读页均按“当前语言 → 英文 → 任一已有语言”选择版本，每本书下方及阅读页都提供版本切换，手动选择会保存在当前浏览器。当前正文以中文为主，简繁体按文件登记；《火星纪事》EPUB 已核对为繁体。英文等版本需实际收录对应文件。

作者和作品使用有意义的公开 slug（例如 `/authors/liu-cixin/`、`/books/三体/`），内部关联使用稳定的作品与文件 ID，阅读进度按文件 ID 保存；修改显示名称不会自动改变网址。

每个作者和作品有独立标题、描述、canonical；作者/作品分别输出 Person/Book JSON-LD，作品封面用于 Open Graph 分享信息。构建还生成 `sitemap.xml` 和 `robots.txt`，已有空正文记录会标为 noindex 并从 sitemap 排除。

SEO 主语言为简体中文，界面语言切换不会生成重复的语言 URL。正文按需加载，不做全文索引。GitHub Pages 项目站的 robots 文件位于项目子路径，不替代域名根路径的 robots 设置。

## 开发环境

| 工具 | 要求 |
| --- | --- |
| Node.js | 基线 **24.22.0 LTS**，允许 `>=24.22.0 <25` |
| pnpm | 固定 **9.15.2** |

`.nvmrc` 和 `.node-version` 固定本地开发版本；`package.json`、`.npmrc` 和运行时检查脚本共同约束安装、启动、测试与构建环境。升级 Node 或包管理器时，需要同时更新这些声明并重新验证。

```bash
git clone https://github.com/VeejaLiu/ScienceFictionCollection.git
git clone https://github.com/VeejaLiu/ScienceFictionCollection-Web.git
cd ScienceFictionCollection-Web
nvm install
nvm use
pnpm --version
pnpm install --frozen-lockfile
pnpm dev --hostname 127.0.0.1
```

打开 [http://127.0.0.1:3014](http://127.0.0.1:3014)。代码改动会自动刷新。

如果本机没有匹配的 pnpm，可以将命令中的 `pnpm` 替换为 `npx --yes pnpm@9.15.2`，无需更改其他项目使用的全局包管理器。

默认从同级 `../ScienceFictionCollection/metadata` 读取 JSON 和引用图片，也可在 `.env.local` 设置 `COLLECTION_METADATA_DIR` 指定其他 metadata 目录，见 [.env.example](../.env.example)。构建只需要 metadata 目录，无需读取或检出小说正文。

内容仓库元信息变更后执行 `pnpm metadata:prepare`，新增作者/作品路由后重启开发服务。同步正文文件名、大小等字段的说明见内容仓库 [metadata/README.md](https://github.com/VeejaLiu/ScienceFictionCollection/blob/master/metadata/README.md)。

生成的 `public/collection/` 和 `out/` 均已忽略，不提交重复资源。读者开始阅读时才需访问 `raw.githubusercontent.com`。阅读进度保存在当前浏览器，不会上传。

## 检查与构建

```bash
pnpm check:runtime
pnpm test
pnpm build
pnpm check:export
```

测试覆盖 metadata 路径绑定、姓名语言回退、数据校验、无正文的 metadata 独立读取、SEO 输出安全、界面语言、素材许可及运行时约束。构建前会同步元信息和当前环境的第三方许可文件，TypeScript 错误会阻止构建。

生产模式预览：

```bash
pnpm build
pnpm start
```

静态预览默认使用端口 3000，也可执行 `pnpm start --port 3015`。无需 Next.js 生产服务器。

### GitHub Pages 项目站

```bash
pnpm build:pages
pnpm start --port 3015
```

`build:pages` 将基础路径设置为 `/ScienceFictionCollection-Web`，规范地址默认使用 `https://veejaliu.github.io/ScienceFictionCollection-Web/`，生成 `out/` 和 `.nojekyll`。预览地址为 `http://127.0.0.1:3015/ScienceFictionCollection-Web/`。

本站通过 [.github/workflows/pages.yml](../.github/workflows/pages.yml) 自动发布到 [GitHub Pages](https://veejaliu.github.io/ScienceFictionCollection-Web/)。推送到本仓库 `master` 会运行测试、静态构建、导出检查和 Pages 部署。工作流使用 `.nvmrc` 中的 Node.js、固定 pnpm 9.15.2，以及锁文件安装依赖；构建只检出小说仓库的 `metadata/`，不会批量读取或打包小说正文。

仅更新小说仓库元信息时，在 [Actions 发布页](https://github.com/VeejaLiu/ScienceFictionCollection-Web/actions/workflows/pages.yml) 点击 **Run workflow**。`content_ref` 默认是小说仓库的 `master`，也可以填写指定分支、标签或提交；运行摘要会记录两个仓库的实际提交。站点不会在每次访问时重新获取 metadata，需要重新发布才能更新目录和图片。

更换域名或仓库名时，应同步修改工作流中的 `SITE_URL`、`scripts/build-pages.mjs` 的基础路径和默认地址，以及 `lib/site.ts`，然后重新构建。正文按阅读请求从小说仓库 `master` 获取，目录与正文的相关更新应先推送到小说仓库。

## 代码结构

```text
app/authors/[slug]/            作者静态页及 SEO 信息
app/books/[slug]/              作品静态详情页及 SEO 信息
app/sitemap.ts, robots.ts    静态站点地图和 robots
components/bookshelf/        作者列表、封面、书架与按需正文阅读
components/language-provider.tsx
                             仅客户端界面语言状态与偏好保存
lib/metadata.ts              元信息类型、结构校验、姓名回退及作品 URL
lib/collection.ts            只读 metadata JSON 和引用图片
lib/site.ts, seo.ts          发布地址、基础路径和结构化数据
lib/i18n.ts                  八种界面的语言词条
public/collection/          从内容仓库生成的元信息和图片，不含正文
licenses/                    许可原文、素材来源记录和依赖清单
scripts/                     元信息准备、静态构建预览和素材维护
```

增加界面文字时，应为 `lib/i18n.ts` 的全部语言补充词条。修改作者姓名、头像或作品封面时，只编辑内容仓库 metadata，不在 Web 中另存一套数据。不保留旧的文件名推断、仓库切换或查询参数阅读路由。

## 素材与第三方许可

整个应用及不同内容的授权状态见 [授权范围说明](../LICENSE-SCOPE.md)。

```bash
pnpm assets:icons
pnpm licenses:generate
```

- 图标生成使用当前锁定的 Lucide 组件，保留 ISC 和 Feather MIT 声明。
- 当前版本不包含或分发网页字体文件，使用访问者设备已安装的系统字体。
- 许可生成器从实际安装的依赖提取声明，包含包内附带的许可文件和已记录的上游许可补充。生成清单包含开发、服务端及平台专属依赖，不表示它们都会下发给浏览器。
- 发布时应在实际发布平台按锁文件安装依赖后重新生成许可文件。MPL、LGPL、CC-BY 等许可的具体分发义务需要按发布内容履行。

详细说明见 [ASSET_NOTICES.txt](../ASSET_NOTICES.txt)、[素材来源记录](../licenses/asset-sources.json) 和 [第三方许可文本](../public/third-party-notices.txt)。软件许可证不构成对小说正文、作者头像或出版社封面的授权；封面出处、参考版本和检索结果见 [内容仓库封面清单](https://github.com/VeejaLiu/ScienceFictionCollection/blob/master/metadata/covers/catalog.json)。

## 上游来源与应用授权

本项目 fork 自 [BiscuitCoder/github_novel_read](https://github.com/BiscuitCoder/github_novel_read)，保留原作者提交历史和来源说明，感谢原作者提供的阅读器基础。

原应用尚未提供开源许可证，我们已通过 [上游 issue #2](https://github.com/BiscuitCoder/github_novel_read/issues/2) 询问独立维护、修改、部署与公开发布派生版本的授权，目前仍等待明确回复。第三方组件的许可证不能替代对上游应用自有代码的授权，本仓库未将整个应用另行声明为 MIT 或其他开源许可。

## 更新首页作者列表

作者姓名与 slug 来自小说仓库 metadata。修改作者资料后运行 `pnpm docs:generate` 更新本仓库 README 的作者入口；项目和技术介绍单独维护在本文档。

## 移动端布局

窄屏作者导航默认收起，点击后在限高区域选择作者；简介显示两行摘要，可展开查看全文与来源。平板和桌面保留侧栏，侧栏独立滚动并随页面保持可见。书卡按作品区域实际宽度排列，最窄屏幕使用单列，普通手机双列，较大区域逐步增加列数。阅读页使用较小的封面与适合窄屏的字号，版本和语言选择控件保持至少 44 像素高度。横竖屏切换恢复当前阅读进度。

本次在侧边栏浏览器测试了 320×740、360×800、390×844、768×1024、1024×768、1440×900 和 844×390 七种视口，并检查了窄屏下的八种界面语言、作者菜单、简介展开、版本切换、书架/列表和正文阅读。这些是浏览器视口模拟结果。

## 阅读器能力与边界

| 格式 | 在线展示 | 阅读位置 | 操作 |
| --- | --- | --- | --- |
| TXT / Markdown | 按原文滚动阅读 | 本机保存滚动进度 | 字号、行距、日夜主题 |
| EPUB | 浏览器内分页，保留章节与插图 | 本机保存 EPUB CFI 位置 | 目录跳转、上一页/下一页、PC 左右方向键、触屏横向滑动、字号和行距 |
| PDF | 打开原始文件 | 由外部阅读器处理 | 暂无内置 PDF 阅读组件 |

EPUB 通过动态加载的 epub.js 解析当前打开的文件，不在构建时读取正文。章节在禁止脚本执行的 iframe 中展示，插入前移除主动内容及事件属性；原始 EPUB 文件不被改写。六份现有 EPUB 已分别验证章节显示，含 EPUB 2、不同目录结构和简繁中文内容。EPUB 的封面进度按章节估算，恢复位置使用 CFI；调整窗口尺寸会重新分页，页数可能改变。

字号、行距和主题偏好保存在当前浏览器。阅读进度与具体文件 ID 绑定；版本切换直接进入所选文件的网址，之前的 TXT 偏好不会把指定 EPUB 链接改回 TXT。全文搜索、书签、批注、离线书架和跨设备同步目前不包含在本轮实现中。

新增依赖中，epub.js 使用 BSD-2-Clause；其许可证及传递依赖记录由许可生成器保留。针对旧依赖配置了明确的 pnpm overrides：移除无运行时代码的废弃类型占位包，使用较新的 XML 解析版本及有独立许可证的浏览器 path 实现；锁文件固定实际版本。`marks-pane` 的发布包仅含 MIT 声明而未附独立许可文件，清单如实保留发布元信息与 SPDX 标准文本模板，没有补造版权声明。
