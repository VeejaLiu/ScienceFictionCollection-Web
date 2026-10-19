# 授权范围与当前状态

本仓库包含上游应用代码、后续修改、独立的第三方组件，以及来自小说仓库的内容和图片。目前没有覆盖整个应用的统一开源许可证，各部分应分别核对。

## 上游应用

本项目 fork 自 [BiscuitCoder/github_novel_read](https://github.com/BiscuitCoder/github_novel_read)，保留原作者的提交历史与来源说明。上游尚未提供开源许可证，我们已通过 [issue #2](https://github.com/BiscuitCoder/github_novel_read/issues/2) 请求明确修改、维护、部署和公开发布派生版本的授权，目前仍待确认。

公开仓库可被查看或 fork，不等于获得任意修改、使用和分发的许可。已部署网站、已有的第三方 MIT 声明，以及我们后续添加的代码，都不能替代对上游代码的授权。

后续取得授权时，应按实际授权的对象、范围和条件更新记录；不会仅凭本说明把整个应用声明为 MIT。

## 第三方代码、图标与依赖

第三方组件和依赖按各自许可证处理。复制的 shadcn/ui 组件、Lucide/Feather 图标及其他依赖的声明，见 [第三方许可文本](public/third-party-notices.txt)、[素材说明](ASSET_NOTICES.txt) 和 [许可目录](licenses/)。这些许可证不覆盖上游应用或其他权利人的内容。

当前网页使用设备系统字体，不分发字体文件。

TXT 目录识别单独复用 [tReader](https://github.com/tiansh/reader) 的章节识别 Worker，固定于提交 `282bcdcd6e60321d37306b5e6eadad4df6f89821`，未引入其阅读界面或其他模块。`public/vendor/treader-toc/worker.js` 保持原样，以可读源码分发，使用 MPL-2.0 并保留 Incompatible With Secondary Licenses 声明；来源与校验值见该目录的 `provenance.json`，许可证见该目录的 `LICENSE` 及 `licenses/treader-toc-MPL-2.0.txt`。

## 小说、头像与封面

正文、作者资料和图片来自独立的 [ScienceFictionCollection 仓库](https://github.com/VeejaLiu/ScienceFictionCollection)，其授权范围见 [内容仓库说明](https://github.com/VeejaLiu/ScienceFictionCollection/blob/master/LICENSE-SCOPE.md)。

小说原文、译文、作者头像和出版封面保留各自权利归属，不因被应用加载、被复制到构建产物或被转换为 WebP 而获得新的许可。封面出处与参考版本见 [封面清单](https://github.com/VeejaLiu/ScienceFictionCollection/blob/master/metadata/covers/catalog.json)；书目来源和原文件可供核对，不是授权证明。

## 后续修改

维护者仅能在有权许可的范围内授权自己的贡献。当前说明不为混合了上游或第三方内容的文件增加统一许可，也不改变已经有效授予的第三方许可。取得上游授权或增加明确标注的独立许可后，再相应更新本文件。
