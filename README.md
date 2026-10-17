# 科幻小说作品集

[ScienceFictionCollection](https://github.com/VeejaLiu/ScienceFictionCollection) 的配套在线阅读网站，由 VeejaLiu 独立维护。

本仓库负责阅读器应用，小说正文继续存放在内容仓库中。站点只读取该内容仓库，不提供切换其他 GitHub 仓库的入口。

## 功能

- 按作者浏览作品，递归读取多层系列目录，例如基地系列、机器人系列和银河帝国系列。
- TXT、Markdown 文件的在线文本阅读，保留完整目录路径，阅读链接可直接打开或刷新。
- 在当前浏览器保存阅读进度；不同系列中的同名作品分别记录。
- 简体中文、繁体中文、英文、法语、德语、俄语、日语和韩语界面。语言偏好通过 Cookie 保存，作者名、书名、系列名和小说正文保留原文。
- 明暗主题切换、基于系统字体的界面与阅读排版。
- 从 Lucide BookOpen 生成站点图标，并在页尾提供第三方许可入口。

目前不解析 EPUB 或 PDF，也不提供账号、跨设备进度同步或正文自动翻译。

## 开发环境

| 工具 | 要求 |
| --- | --- |
| Node.js | 基线 **24.22.0 LTS**，允许 `>=24.22.0 <25` |
| pnpm | 固定 **9.15.2** |

`.nvmrc` 和 `.node-version` 固定本地开发版本；`package.json`、`.npmrc` 和运行时检查脚本共同约束安装、启动、测试与构建环境。升级 Node 或包管理器时，需要同时更新这些声明并重新验证。

```bash
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

本地运行不需要配置环境变量。目录和正文通过 GitHub API、`raw.githubusercontent.com` 读取，需要能访问相应网络服务；请求会受到 GitHub 可用性、缓存与限流的影响。阅读进度保存在当前站点的浏览器本地存储中，不会上传到服务器。

## 检查与构建

```bash
pnpm check:runtime
pnpm test
pnpm typecheck
pnpm build
```

测试覆盖系列目录递归、完整阅读路径、进度键、界面语言、素材与许可文件，以及运行时版本限制。构建前会重新生成当前安装环境的第三方许可文件，TypeScript 错误会阻止构建。

生产模式预览：

```bash
pnpm build
pnpm start
```

生产服务默认使用端口 3000，也可以通过 `pnpm start --port 3014` 指定端口。应用使用 Next.js Server Actions，需要支持服务端运行的部署环境，不能直接作为纯静态站点发布。

## 代码结构

```text
app/                         页面、页面元信息和固定内容仓库的服务端操作
components/bookshelf/        作者列表、分组书架、阅读页和阅读进度
components/layout/           页头、页尾和语言入口
components/language-provider.tsx
                             界面语言状态与偏好保存
lib/site.ts                  内容仓库与 Web 仓库信息
lib/github.ts                GitHub 目录、递归书目和正文读取
lib/book-path.ts             阅读路径与路径校验
lib/i18n.ts                  八种界面的语言词条
public/authors/              作者头像
public/icon.svg              Lucide 派生站点图标
public/third-party-notices.txt
                             随站点发布的第三方许可文本
licenses/                    许可原文、素材来源记录和依赖清单
scripts/                     运行时检查、图标生成和许可生成
tests/                       回归检查
```

增加界面文字时，应在 `lib/i18n.ts` 中为全部语言补充对应词条。内容仓库地址集中定义于 `lib/site.ts`，服务端不接受访问者指定其他仓库或任意正文下载地址。

## 素材与第三方许可

```bash
pnpm assets:icons
pnpm licenses:generate
```

- 图标生成使用当前锁定的 Lucide 组件，保留 ISC 和 Feather MIT 声明。
- 当前版本不包含或分发网页字体文件，使用访问者设备已安装的系统字体。
- 许可生成器从实际安装的依赖提取声明，包含包内附带的许可文件和已记录的上游许可补充。生成清单包含开发、服务端及平台专属依赖，不表示它们都会下发给浏览器。
- 发布时应在实际发布平台按锁文件安装依赖后重新生成许可文件。MPL、LGPL、CC-BY 等许可的具体分发义务需要按发布内容履行。

详细说明见 [ASSET_NOTICES.txt](ASSET_NOTICES.txt)、[素材来源记录](licenses/asset-sources.json) 和 [第三方许可文本](public/third-party-notices.txt)。软件许可证不构成对小说正文或作者头像的授权。

## 上游来源与应用授权

本项目 fork 自 [BiscuitCoder/github_novel_read](https://github.com/BiscuitCoder/github_novel_read)，保留原作者提交历史和来源说明，感谢原作者提供的阅读器基础。

原应用尚未提供开源许可证，我们已通过 [上游 issue #2](https://github.com/BiscuitCoder/github_novel_read/issues/2) 询问独立维护、修改、部署与公开发布派生版本的授权，目前仍等待明确回复。第三方组件的许可证不能替代对上游应用自有代码的授权，本仓库未将整个应用另行声明为 MIT 或其他开源许可。
