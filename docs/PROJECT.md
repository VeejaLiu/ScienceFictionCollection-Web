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
- 作者头像、默认姓名、多语言姓名、简短介绍与作品封面由内容仓库统一维护。当前登记17位作者、1种期刊，合计224组小说作品、2期期刊和228个阅读文件；头像最长边160像素、封面不超过600×900像素，统一保存为WebP。封面可使用对应EPUB的内嵌图片或已核对的出版参考封面，出处与版本说明由metadata记录；未核实的作品使用生成式封面。
- 简体中文、繁体中文、英文、法语、德语、俄语、日语、韩语界面；作者名称按 metadata 对应语言显示。第一版已录入简中、繁中、英文姓名，其他名称可继续补充。
- 目录只加载元信息；打开某本书后，浏览器自动请求这一本 TXT/Markdown 正文并恢复阅读进度，无需再次点击。EPUB 在页面内加载并支持目录、翻页和位置恢复；PDF 提供原始文件链接。
- 通过稳定作者 id 和作品 id 保存当前浏览器的阅读进度；不提供账号或跨设备同步。
- 纯静态导出，适配 GitHub Pages 项目站；构建不读取、下载或打包小说正文。EPUB 阅读库仅在打开 EPUB 时加载。

## SEO 与静态页面

首页、作者页 `/authors/<slug>/` 和作品页 `/books/<slug>/` 都在构建时生成真实 HTML，包含名称、目录链接、封面及作品详情。搜索引擎无需等待浏览器获取元信息。

期刊设有独立入口 `/periodicals/` 和刊物页 `/periodicals/<slug>/`，与小说作者分别显示。各刊按年份从新到旧分组，同年按整数期号从小到大排列，避免第10期排在第2期之前。各期阅读页沿用稳定的 `/books/<slug>/` 网址及进度ID；原有刊物入口仍保留，并指向新的规范网址。SEO使用Periodical和PublicationIssue，不把杂志社标成个人作者。

内容仓库的 `authors.json`、`books/` 只维护作家与小说；作者通过 `booksFile` 指向 `books/<作者slug>.json`，ID保留在文件内容中，不从编号拼接文件名。`periodicals.json` 注册刊名和出版机构，通过 `issuesFile` 指向 `issues/<刊物slug>.json` 分期清单。共享阅读器在加载时适配这两种目录，正文继续按已登记的目录与路径加载。历史核对和收录记录不作为网站分类数据。

封面图片在内容仓库按 `covers/works/<作者slug>/<作品名称slug>/<版本>.webp` 保存；期刊封面按 `covers/journals/<刊物slug>/<年份>/issue-<期号>-<版本>.webp` 保存。来源平台编号、ISBN和图像摘要保留在封面清单中。元信息准备脚本按引用复制深层目录，页面继续通过 `cover` 字段加载；无封面时使用即时绘制的替代图。旧的静态示例图片及其独立生成脚本已移除。

同一作品的多语言正文通过 metadata 中的 `workId` 关联；每个实际文件保留独立 ID、slug 和语言标记。目录和阅读页均按“当前语言 → 英文 → 任一已有语言”选择版本，书目中提供版本切换，手动选择会保存在当前浏览器。阅读页直接展示正文，不再重复展示作者、封面、格式、版本和原始文件信息。当前正文以中文为主，简繁体按文件登记；《火星纪事》EPUB 已核对为繁体。英文等版本需实际收录对应文件。

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

窄屏作者导航默认收起，点击后在限高区域选择作者；简介显示两行摘要，可展开查看全文与来源。平板和桌面保留侧栏，侧栏独立滚动并随页面保持可见。书卡按作品区域实际宽度排列，最窄屏幕使用单列，普通手机双列，较大区域逐步增加列数。阅读页直接进入正文，阅读设置不占正文布局空间：桌面鼠标移到顶部时显示悬浮面板，顶部与面板之间的移动区域保持展开，移开后短暂延迟隐藏；操作控件或选择行距期间保持显示，点击正文关闭。手机点击 Aa 打开底部面板，可滚动并保持关闭按钮可见，支持遮罩、关闭按钮和 Esc；平板触屏也可通过 Aa 打开设置。控件保持至少 44 像素的触控高度，横竖屏切换恢复当前阅读进度。

本次在侧边栏浏览器测试了 320×740、360×800、390×844、768×1024、1024×768、1440×900 和 844×390 七种视口，并检查了窄屏下的八种界面语言、作者菜单、简介展开、版本切换、书架/列表和正文阅读。这些是浏览器视口模拟结果。

## 阅读器能力与边界

| 格式 | 在线展示 | 阅读位置 | 操作 |
| --- | --- | --- | --- |
| TXT / Markdown | 按原文连续滚动阅读，自动识别章节标题 | 本机保存滚动进度 | 左侧章节导航、当前章节高亮、字体与排版、阅读配色 |
| EPUB | 浏览器内分页，保留章节与插图 | 本机保存 EPUB CFI 位置 | 目录跳转、上一页/下一页、PC 左右方向键、触屏横向滑动、字体与排版、阅读配色 |
| PDF | 打开原始文件 | 由外部阅读器处理 | 暂无内置 PDF 阅读组件 |

EPUB 通过动态加载的 epub.js 解析当前打开的文件，不在构建时读取正文。章节在禁止脚本执行的 iframe 中展示，插入前移除主动内容及事件属性；原始 EPUB 文件不被改写。六份现有 EPUB 已分别验证章节显示，含 EPUB 2、不同目录结构和简繁中文内容。EPUB 的封面进度按章节估算，恢复位置使用 CFI；调整窗口尺寸会重新分页，页数可能改变。

阅读设置的常用项包括字号、行距、正文宽度（窄/标准/宽）、字体（衬线/无衬线/系统）和配色（网站默认/纯白/米黄/浅灰/深色）。“更多排版”提供段间距、文字粗细、首行缩进（保留原文/无/两字）、对齐和字间距。字体使用设备已有字体，无需下载字体资源；实际字形取决于系统安装情况。设置即时生效并保存在当前浏览器，旧版仅有字号/行距的偏好会补齐新字段，可一键恢复默认。阅读配色覆盖当前阅读页的正文与控件，返回书架后移除；顶部日夜切换仍可用，并切回网站主题配色。

TXT 段落按空行和带缩进的中文行划分，普通换行继续保留在同一段内，避免把英文硬换行逐行缩进；原始缩进字符保留在 DOM，选择无缩进或两字缩进时只调整显示，避免叠加缩进。段距统一由段落样式控制，原空行仍保留在隐藏节点中；全文字符与源文本一致。EPUB 的排版作用于正文 iframe，恢复原文缩进时移除对应覆盖规则；调整排版后继续使用 CFI 保持位置。

TXT 刷新恢复会等待章节与段落布局完成，再即时定位到保存的阅读进度；调整宽度或排版时沿用当前进度，避免目录识别较晚完成导致位置偏移。手机的宽度选项调整左右留白，桌面按正文最大宽度调整，并为章节导航预留空间。

阅读进度与具体文件 ID 绑定；版本切换直接进入所选文件的网址，之前的 TXT 偏好不会把指定 EPUB 链接改回 TXT。全文搜索、书签、批注、离线书架和跨设备同步目前不包含在本轮实现中。

### 章节识别与导航

TXT 没有标准目录，本项目单独复用 tReader 的目录识别 Worker（提交 `282bcdcd6e60321d37306b5e6eadad4df6f89821`，源码、MPL-2.0 及来源记录见 `public/vendor/treader-toc/`），不加载其阅读界面。Worker 按重复标题格式与统计特征识别章节；`lib/text-chapters.ts` 补充中英文明确章回标题、序言/后记、卷章层级、Markdown 标题和连续数字编号，并过滤可以确定的印刷目录重复项。纯编号需要足够的连续性与章节正文长度，避免把普通短列表当成目录。

识别只在浏览器打开当前作品后进行，不在构建时读取正文，也不上传正文或改写原文件。用于识别的换行规范化会映射回原始字符位置；识别出的标题独立成行，以稍大字号、加粗和上下留白区分正文，随阅读字号缩放，长标题自动换行，卷章层级使用递减字号。标题相邻的原有空行和标题缩进仅在显示时收敛，全部正文、前言、目录页、空白与换行仍保留在 DOM 中，原始文件不变。识别失败、Worker 不可用或超时时仍可连续阅读；无可靠标题时显示未识别到章节，不编造目录。自动识别不能保证覆盖所有非标准标题。

当 TXT 的标题和正文因缺失换行粘连时，可在内容仓库对应作品的 `chapterTitleCorrections` 中登记已核对的行首 `prefix` 和标题 `title`，两者保留原始字符和空格。只有行首唯一匹配、且标题为该前缀开头时才应用边界；正文版本变动或匹配不唯一时忽略，仍保留自动识别结果。此字段同时补充被长度限制漏掉的标题，不按句号、固定字数或猜测的语言模式截断正文。《地心游记》的第二十六章和第四十五章已登记这类边界修正。

TXT 与 EPUB 共用章节导航，EPUB 读取文件自带目录。宽度至少 1024px 时在左侧显示独立滚动目录，当前章节随正文滚动高亮；窄屏通过左下角浮动目录按钮打开左侧抽屉，选择后关闭并定位到章节，支持关闭按钮、遮罩和 Esc。窄桌面给正文预留侧栏空间，大屏保留原有正文宽度；目录与顶部悬浮字号工具不占正文的垂直空间。

章节验收覆盖中文/英文/纯编号、卷章层级、原始换行与字符位置、正文短列表排除、印刷目录去重、刷新恢复、移动端触控和八种界面语言；原创 TXT fixture 的渲染文本与原始 UTF-8 内容校验一致。另对当前《中国2185》单本核对实际识别结果，以原创 EPUB fixture 验证原生目录跳转，并检查发布子路径下的 Worker 与许可文件。移动端检查使用无界面浏览器模拟，未进行真实设备验收。

新增依赖中，epub.js 使用 BSD-2-Clause；其许可证及传递依赖记录由许可生成器保留。针对旧依赖配置了明确的 pnpm overrides：移除无运行时代码的废弃类型占位包，使用较新的 XML 解析版本及有独立许可证的浏览器 path 实现；锁文件固定实际版本。`marks-pane` 的发布包仅含 MIT 声明而未附独立许可文件，清单如实保留发布元信息与 SPDX 标准文本模板，没有补造版权声明。
