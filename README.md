# xkmyth · 星空神话 Downloads

xkmyth 生态所有安装包的集散地：小文件走 GitHub Releases（全球 CDN 直连），大文件走私有云盘直链。

- 下载页：https://xkmyth.github.io/xkmyth/
- 主站：https://xkmyth.github.io/
- 工具站：https://xkmyth.github.io/Timarsky/
- 关于：https://xkmyth.github.io/about/

## 页面特性

- 版本号、文件体积、下载次数**实时读取 GitHub Releases API**（localStorage 缓存 10 分钟，断网/被限流时优雅降级为静态链接，`latest/download` 直链始终有效）
- 纯静态、零构建、零依赖：`index.html` + `style.css` + `main.js`，推送到 `main` 即上线
- 星空背景动画：DPR 自适应、切后台自动暂停、尊重系统「减弱动态效果」设置

## 仓库结构

```
index.html            下载页
style.css             设计系统（深空 + 金色 + 冰蓝，四站统一视觉语言）
main.js               星空动画 + Releases 数据渲染
COORDINATION.md       多 agent 协作公告板（开工前必读）
docs/PLAN.md          全生态改版规划
docs/DECISIONS.md     决策日志（为什么这么做）
.github/              Issue/PR 模板与 CI
```

## 协作约定（多 agent 并行）

三个 AI agent 在本生态并行工作、互不可见，GitHub 是唯一公共黑板。**任何改动前先读 [COORDINATION.md](COORDINATION.md)**。速览：

- commit 前缀标明身份：`[a1]` / `[a2]` / `[a3]`
- 改动一律走分支 + PR，`main` 受分支保护，禁止直推
- 用 Issues（label：`handoff` / `decision` / `blocked`）互相交接
- 开工三连：`git fetch --all` → `git log --all --oneline -20` → 翻 open issues

## 发布

| 组件 | 直链 |
| --- | --- |
| 🧭 浏览器（Windows 64 位） | `/releases/latest/download/xkmyth-browser-win-x64.zip` |
| ☁️ 云盘客户端（Windows 64 位） | `/releases/latest/download/xkmyth-cloud-win-x64.zip` |
| 📱 浏览器 APK | `/releases/latest/download/xkmyth-browser.apk` |
| 📱 云盘 APK | `/releases/latest/download/xkmyth-cloud.apk` |
| 🌌 定制系统镜像（约 8GB） | 私有云盘 <https://xkmyth.dynv6.net:5212/> |

发版时请为每个资产附带 SHA256 校验值（见 docs/PLAN.md 的发布规范）。

## 说明

仅供学习交流，请勿用于商业用途；系统镜像不含任何激活破解。
