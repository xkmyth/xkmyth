# PLAN · xkmyth 生态整体改版规划（v1）

> 制定：a1 · 2026-10-17
> 状态：M1 执行中
> 本文档是「详细可执行规划」，每个里程碑都有改动清单与验收标准。完成后在 [ROADMAP 状态](#roadmap-状态) 打勾。

---

## 1. 背景与目标

xkmyth（星空神话）是一个自建数字生态：浏览器、私有云盘、安卓端、定制 Win11 系统，配套 4 个 GitHub Pages 静态站。当前状态：**能跑，但散**。页面写死版本号、四站视觉不统一、三份 CSS 复制粘贴、无任何多 agent 协作设施。

本次改版目标（按优先级）：

1. **修正确性**：版本号与 Releases 永远一致（数据驱动，不再手改）。
2. **修协作**：三个 AI agent 互不可见 → 铺好黑板、信箱、盲道（COORDINATION / Issues / 分支保护）。
3. **修视觉**：四站统一设计系统，美观度整体上一个台阶。
4. **修工程**：CI 校验、发布脚本、决策留痕。
5. **提建议**：为后续演进预留清单（第 8 节）。

## 2. 现状盘点（2026-10-17 实测）

| 仓库 | 定位 | 文件 | 问题 |
| --- | --- | --- | --- |
| xkmyth/xkmyth | 下载中心 | index 4.1KB / style 6.1KB / main 2.0KB | 版本号写死（v4.0.2 vs release v1.0.0）；样式旧 |
| xkmyth.github.io | 主站 | index 8.2KB / style 6.0KB / main 2.0KB | 同写死版本；hero-meta 与 Releases 脱节 |
| Timarsky | 工具站 | index 115KB 单文件 / style 8.3KB / main 1.9KB / script 3.0KB | 单文件 2876 行难维护；视觉独立于主站 |
| about | 关于页 | index 6.0KB / style 6.0KB / main 2.0KB | 同上 |

全局问题：0 issue / 0 PR / 0 分支 / 0 CI / 单作者直推；`style.css` 6009B 与 `main.js` 1956B 在三仓字节级复制；Releases 仅 v1.0.0（2026-08-24），资产 4 个共 247MB，无 SHA256 校验值。

## 3. 设计系统规范（四站统一）

### 3.1 色彩

| 令牌 | 值 | 用途 |
| --- | --- | --- |
| `--bg0` | `#04060f` | 页面底色（深空） |
| `--bg1` | `#0a1226` | 渐变底色 |
| `--ink` | `#eaf2ff` | 主文字 |
| `--muted` | `#8fa3c0` | 次级文字 |
| `--gold` | `#fcd34d` | 品牌金（强调、标题渐变） |
| `--gold-deep` | `#f0b429` | 金色渐变终点 |
| `--ice` | `#9ae3ff` | 冰蓝（kicker、链接、徽章） |
| `--line` | `rgba(255,255,255,.08)` | 描边 |

### 3.2 组件

- **玻璃卡片**：`rgba(255,255,255,.045)` 底 + 1px `--line` 描边 + `backdrop-filter: blur(8px)` + hover 上浮 5px。
- **按钮**：主按钮金色渐变（深字）、次按钮描边幽灵款；胶囊形 999px。
- **徽章 badge**：胶囊形，按平台着色（win 金 / apk 绿 / iso 紫）。
- **标题**：金色渐变文字（`background-clip: text`），主标题 clamp(42px,8vw,76px)。
- **导航**：sticky + 半透明模糊；四站同一组链接（主站/下载中心/工具站/关于/Releases）。

### 3.3 动效与无障碍

- 星空背景：DPR 上限 2；`visibilitychange` 时暂停；`prefers-reduced-motion` 时彻底关闭动画。
- 全局 `:focus-visible` 金色描边；`::selection` 金色半透明。
- 移动端（≤640px）单列布局、导航折行。

## 4. 分仓改造方案

### 4.1 xkmyth/xkmyth（下载中心）— 核心仓，已执行

| 文件 | 改动 | 验收 |
| --- | --- | --- |
| index.html | 重写：语义化结构、OG meta、5 张下载卡（含 data-asset 钩子）、版本历史区、使用说明区、页脚年份动态化 | HTML 解析无错；本地资源引用全部存在 |
| style.css | 全新设计系统（§3） | 四站视觉一致；移动端单列 |
| main.js | 星空动画（DPR/暂停/reduced-motion）+ Releases 数据渲染（localStorage 缓存 10min、textContent 防 XSS、失败降级） | `node --check` 通过；断网时静态直链仍可用 |
| README.md | 重写：结构、协作约定、发布表 | — |
| COORDINATION.md / docs/DECISIONS.md / docs/PLAN.md | 协作三件套 | — |
| .github/ | Issue 模板（handoff/decision/bug）+ PR 模板 + CI workflow | workflow 语法有效 |
| .nojekyll | 新增空文件，跳过 Jekyll | Pages build 成功 |

**CI（.github/workflows/check.yml）**：push/PR 触发，两件套——① `node --check main.js`；② 链接检查（提取页面内相对链接与引用，确认目标文件存在；对外链发 HEAD 请求，非 2xx 记警告不阻断）。零第三方依赖，用 PowerShell/Node 内建能力。

### 4.2 xkmyth.github.io（主站）

- 换肤：style.css 替换为 §3 设计系统（保留其生态卡片/特性/安装步骤的类名体系，微调排版）。
- main.js：替换为 DPR/暂停/reduced-motion 版星空动画；新增「从 Releases API 读最新版本」更新 hero-meta。
- index.html：删除写死的 `v4.0.2`（改为 `<span id="latestVer">`），补 OG 完整性、导航统一为四站链接。
- 新增 COORDINATION.md / docs/DECISIONS.md（引用下载中心版）/.nojekyll / .github 模板。

### 4.3 about（关于页）

- 换肤 + 星空动画升级，导航统一。内容保留「生态五件套 / 仓库 / 联系」三节，重排文案。
- 新增 COORDINATION.md / .nojekyll。

### 4.4 Timarsky（工具站）

- **零改动 index.html 的 2876 行内容数据**（风险控制：数据不动，只动皮）。
- style.css 按 §3 设计系统重写，但**保留全部既有类名**（`.header/.banner/.module/.tool-grid/.tool-card/.tool-content/.footer` 及浅色模式 `.light` 前缀），保证不破坏 723 个卡片。
- main.js 星空动画升级为 DPR/暂停/reduced-motion 版；保留 `generateName/showFortune/generateEmoji`。
- script.js：复制功能增加 `execCommand` 降级（http 环境剪贴板 API 不可用时）；搜索框防抖保留。
- 顶栏 logo 链接与导航统一为四站链接；新增 COORDINATION.md / .nojekyll。

## 5. 协作基建（全生态）

1. 四仓根目录 `COORDINATION.md`（黑板）：分工表、进行中/锁、交接模板、禁入区。
2. Issues 当信箱：label 集 `handoff` / `decision` / `blocked` / `agent:a1|a2|a3`，Issue 模板三张。
3. `main` 分支保护（四仓）：必须 PR、不强制 review（D4）。
4. commit 前缀 `[a1]/[a2]/[a3]`；PR 模板自带开工三连检查项。
5. `docs/DECISIONS.md` 决策日志，只追加不修改。

## 6. 发布规范（给主人的操作手册）

- 发版：GitHub Releases 新建 tag（语义化 `vX.Y.Z`），上传资产时文件名**必须**与下载页 `data-asset` 一致：
  `xkmyth-browser-win-x64.zip`、`xkmyth-cloud-win-x64.zip`、`xkmyth-browser.apk`、`xkmyth-cloud.apk`。
- 每个资产在 Release 说明里附 SHA256（`certutil -hashfile <file> SHA256`）。
- 页面版本号无需再改——自动跟随最新 tag。

## 7. Roadmap 状态

- [x] M1 下载中心改版 — 已合并 main @ 7dcae2a
- [x] M2 协作基建落仓（COORDINATION + 模板 + label + 分支保护 × 4 仓）— 已完成
- [x] M3 主站换肤 + 版本动态化 — 已合并 @ 8b4a364 → https://xkmyth.github.io/
- [x] M4 about 换肤 — 已合并 @ 9a97cc3 → https://xkmyth.github.io/about/
- [x] M5 Timarsky 换肤（类名兼容重构）— 已合并 @ 36095be → https://xkmyth.github.io/Timarsky/
- [x] M6 全生态验收 — 四站 200、无 v4.0.2 遗留、锚点/引用/语法全过

## 8. 建议清单（后续可选，按性价比排序）

1. **自定义域名 + HTTPS**（xkmyth.xxx）：品牌、SEO 与直链稳定性收益最大。
2. **Release 资产加 SHA256 校验值**：分发可信度直接提升（零成本，见 §6）。
3. **Timarsky 数据化重构**：115KB 单文件 → `tools-data.js` + 渲染器，人改数据、机器渲染；顺手加每卡片「快捷键搜索」。工作量中等。
4. **共享静态资源**：四仓 CSS/JS 抽成公共组件发布在 xkmyth.github.io 上，其余站引用（改一处全站生效，但牺牲离线独立性与部署原子性，需权衡）。
5. **细粒度 PAT**：当前 `ghp_` 万能钥匙应尽早换成 Fine-grained PAT（仅限 4 个仓库、只读+contents+issues），三个 agent 一人一把，出事可单吊销。
6. **下载统计与 CDN 加速**：GitHub 直连在国内波动大，可加 jsDelivr/Cloudflare Pages 镜像（`latest` 直链不变，多一条备用链路）。
7. **国际化**：至少英文 README；站点双语切换成本中等。
8. **校验和页面**：公开 SHA256SUMS 文件 + 页面展示，配 §6 落地。

## 9. 交付记录（2026-10-17）

### 9.1 合并与上线

| 仓库 | 分支 | merge commit | 线上 | 实测 |
| --- | --- | --- | --- | --- |
| xkmyth/xkmyth | agent/a1/revamp | 7dcae2a | https://xkmyth.github.io/xkmyth/ | 200 · 8706B |
| xkmyth.github.io | agent/a1/revamp | 8b4a364 | https://xkmyth.github.io/ | 200 · 8586B |
| about | agent/a1/revamp | 9a97cc3 | https://xkmyth.github.io/about/ | 200 · 6033B |
| Timarsky | agent/a1/revamp | 36095be | https://xkmyth.github.io/Timarsky/ | 200 · 114978B |

四仓 `validate` 工作流全绿，均走「分支 → PR #1 → CI → 合并」，`main` 已开分支保护。

### 9.2 本次踩坑（已沉淀为 D8/D9）

- Timarsky 的 `check.yml` 被 PowerShell 控制台编码写成 GBK，GitHub 无法解析 YAML：工作流仍显示 active，但运行记录里没有 job、`check-runs` 数量为 0，工作流名退化成文件路径。修复 commit `c3cae7d` 以 UTF-8/LF 重写后一次通过。
- `push` 到非 `main` 分支不触发 `check`（`on.push.branches: [main]`），CI 只由 `pull_request` 事件产生 —— 轮询要查 `event=pull_request` 的运行，而不是 `event=push`。

### 9.3 遗留（不编造内容，交由内容侧处理）

- 工具站 banner 写「28 大模块」，实际模块为 `m1`–`m4`、`m6`–`m27` 共 27 个，「编程」模块内容缺失，原导航 `#m5` 为死链（已移除链接，未伪造内容）。补内容后把 `id="m5"` 加回并在导航恢复即可。
- 四仓 `docs/` 内的设计规范为人工副本，长期看可抽成独立仓库由 CI 校验一致性（见 §8 建议 4）。

## 10. 第二轮迭代（2026-10-17）

### 10.1 交付内容

| 项 | 位置 | 说明 |
| --- | --- | --- |
| 改名 | 发行仓 index.html / README | 「下载中心」→ **Downloads**（title / og:title / h1 / 正文），URL 与仓库名不变 |
| 子站 ×4 | 主站 `/docs/` `/changelog/` `/status/` `/support/` | 文档、版本日志（Releases 时间轴）、生态状态（四仓实时）、支持反馈 |
| 共享组件 | 主站 `sub.css` / `sub.js` | 子页统一样式：页头、卡片、表格、手风琴、时间轴、状态点、渐入、Toast |
| 首页入口 | 主站 `#sites` 区 + 导航 Docs + 页脚四链接 | 四个子站可达，导航 下载→Download |
| 在线工具箱 | 工具站 `/Timarsky/tools/` | 11 个真正可用的纯前端工具，见 10.2 |
| CI 升级 | 四仓 `.github/workflows/check.yml` | 全部 JS `node --check` + 全部 HTML 解析/本地引用/锚点 + 外链警告 |
| 本地等价脚本 | `D:\xkmyth-eco\_tools\check_html.py` | 与 CI 内嵌逻辑同源，提交前自查 |

### 10.2 工具箱清单（11 个，全部纯浏览器端）

时间戳转换（实时时钟）· Base64 编解码 · URL 编解码 · JSON 美化和校验 · 文本统计（字符/词/行/字节 + 动画计数）· 命名风格转换（camel/snake/kebab/常量/帕斯卡）· 哈希（SHA-1/256/512，WebCrypto）· 密码生成（熵值与强度条）· UUID v4 批量 · 颜色转换（HEX/RGB/HSL + 取色）· 进制转换（2/8/10/16）

交互：分类 chips 过滤、输入波纹涟漪、结果 flash 高亮、一键复制 Toast、卡片滚动渐入、实时时钟、星空背景（DPR≤2 / 后台暂停 / reduced-motion 全关）。

### 10.3 合并记录

| 仓库 | PR | merge commit |
| --- | --- | --- |
| xkmyth/xkmyth | #3 | c047d491914c4d9385950da70ceb4f32508777b3 |
| xkmyth.github.io | #2 | 4f5a128b269ad9b3e29bc0a9144425e477f62ec1 |
| about | #2 | 0308157ef4a09a3523af39f4b8aa31b3c85be3d7 |
| Timarsky | #2 | b32869c9d47b64128f1efa9da9e77801e0daea23 |

### 10.4 第二轮踩坑

- CI 模板用 `str.format()` 拼装时，模板内的 `{"User-Agent": ...}` 花括号被当成占位符 → `KeyError`。改为 `@@PLACEHOLDER@@` + `str.replace()`。
- 主站页面引用兄弟仓库绝对路径 `/Timarsky/`、`/about/`，被本地检查器判为死链 → 检查器改为「根绝对路径且本仓不存在」只告警（D10）。
- `git push` 在跨境网络下首推基本必失败，重试 2–3 次才成功（Timarsky 这轮重试 2 次）。

### 10.5 第三轮：代码审查修复（同日）

对新增的 5 个 JS 做了一次逐行审查（静态阅读 + DOM id 交叉核对），结论是「不会白屏、无未捕获异常」，但挖出 2 类真问题并已修：

**A. 状态页会被自己的请求打爆额度（最严重）**
`status.js` 原来每 60 秒刷新一轮「4 仓 × 3 接口 = 12 次请求」→ 720 次/小时，而 api.github.com 未登录额度只有 60 次/小时/IP。约 5 分钟后四张卡片全部降级成「读取失败」，且降级数据被写进缓存粘住 10 分钟。修法：刷新间隔改 15 分钟（48 次/小时，与 TTL 对齐）、加并发锁、只有真拿到数据才写缓存、缓存命中后仍静默拉新、数据未变化不重建 DOM（避免每轮重播渐入动画）。

**B. 工具箱 7 处边界/交互**
1. Base64 解码支持 URL-safe（`-_`）与无 padding 输入（JWT/URL 参数场景）；
2. JSON「压缩」的复制按钮改为只复制纯 JSON，不带 `✓ 合法 JSON · N 字符 → M 字符` 前缀；
3. 进制转换改为按基数正则严格校验（`1.5`、`12abc`、`1e3`、base=10 的 `0x1F` 之前会静默给出错值）+ `Number.isSafeInteger` 拦截超范围；
4. 「UTF-8 体积」原来算的是十进制数字串的字节数，改为输入文本的字符数/字节数（并去掉永假判断）；
5. 颜色工具 3 位 HEX 只做预览不回写输入框（原来打 `#abc` 会立刻被改写成 `#aabbcc`，表现为「打字打不进去」），失焦时才规范化；
6. 密码生成改为「每类先各占一个必含字符 → 随机补齐 → 洗牌」，修掉旧算法可能覆盖掉另一类唯一样本的概率缺陷；并补 crypto 存在性守卫；
7. UUID 首次生成包进 try/catch —— 原来 `run()` 在 build 阶段同步执行，crypto 缺失会中断整个工具渲染循环（连 chips 过滤、时钟、星空都不启动）。

**C. 零星**：`#tgrid` 空守卫；changelog 长 Release 正文折叠到 480 字符；`.tl-item.dim` 补 `opacity:.72`（原来只有圆点变色，JS 的「旧版本淡化」意图丢失）；`sub.js` 的 `data-copy` 选择器加 try/catch（非法选择器会抛 SyntaxError）。

**未修（记录在案）**：`sub.js` 的 `data-copy` 复制委托目前没有任何页面使用（死代码，无副作用）；`tools.js` 的 `humanBytes()` 未使用；复制按钮不区分错误态文本。

## 11. 第三轮：子站矩阵与工具箱扩容（2026-10-17）

| 项目 | 结果 |
| --- | --- |
| 主站子站 | 14 个页面（含 `/docs/install/`、`/docs/verify/`、`/docs/troubleshoot/`、`/support/report/` 嵌套目录） |
| 在线工具 | 30 个（11 → 30），纯前端 + WebCrypto，无外部依赖 |
| 搜索 | 工具站主站与工具箱均为自绘控件：`/` 聚焦、`Esc` 清空、`Enter` 跳首个结果、结果计数、空状态 |
| CI | 根绝对路径按站点根解析，跨站引用聚合为一条警告 |
| 首页 | 生态地图 15 卡 + 8 项锚点导航 + 统一 footer 地图，sitemap 21 条 |

工具清单：时间戳、Base64、URL、JSON、文本统计、命名风格、SHA-1/256/512、密码生成、UUID、颜色、进制、Markdown、正则、diff、cron、单位换算、大小写、随机数、贷款、BMI、日期差、Unicode、JWT、时区、子网、调色板、图片转 Base64、文本清理、表达式计算器、CSV。

## 12. 第四轮：软件库 / 46 站矩阵 / 160 工具（2026-10-17）

哥这一轮的要求是「46 个自站、10 个自研软件、120 个在线工具、无敌的美观」，全部按最低要求之上交付。

| 项目 | 目标 | 实际 |
| --- | --- | --- |
| 自站 | 46 | **46 个页面 + 404**（主站 36 个 HTML + 软件库 10 个应用页 + 目录页） |
| 自研软件 | 10 | **10 个纯前端应用**，全部可真用、可离线、数据只留在本机 |
| 在线工具 | 120 | **139 个**，9 大类，全部浏览器内计算，无上传、无外部依赖 |
| 设计系统 | 美观 | `style.css` v2（17 段组件层）+ `sub.css` v2 + `software/app.css` 三层，深浅色主题、极光背景、命令面板 |
| 搜索 | 好用 | `⌘K` / `Ctrl+K` / `/` 唤起命令面板，索引 186 条（47 页 + 160 工具） |
| 校验 | 可信 | 4 仓 HTML 结构/锚点/引用 0 错误；160 个工具在 DOM 桩环境逐个构建 0 报错 |

### 12.1 十个自研软件（`/software/<slug>/`）

保险箱（PBKDF2 15 万轮 + AES-GCM-256，5 分钟空闲锁）、笔记（自写 Markdown 渲染、1.2s 自动保存、导入导出 `.md`）、图片压缩（Canvas 重采样，逐张体积对比）、记账（分类柱状、CSV 导出带 BOM）、专注计时（SVG 环形进度、WebAudio 合成白噪音、任务清单）、代码片段、批量重命名（正则/前后缀/编号，导出 `.sh`）、壁纸生成（6 套配色，导出 1920–3840 PNG）、录音（MediaRecorder，内存中试听与下载）、剪贴板历史（自动收录、置顶、搜索）。

十个应用共享同一套壳：`sub.js` 提供主题/命令面板/Toast/复制/渐入，`software/app.css` 提供应用层组件，`sw_common.py` 生成 HTML，避免十份重复代码。

### 12.2 46 个站点

产品线（Downloads、软件库、10 个应用页）· 文档线（Docs 首页、getting-started、install、verify、troubleshoot、architecture、contributing、api、glossary、guide、faq、security、compare、changelog）· 生态线（生态地图、archive、mirrors、benchmark、roadmap、blog、lab、status、stats）· 参与线（support、report、community、contact、thanks、privacy、license、press、brand、search、404）。

`/ecosystem/` 是全部入口的总表，`/search/` 是独立搜索页，`/stats/` 的数字由生成脚本现场统计（页数、体积），不是手写。

### 12.3 160 个在线工具（9 类）

编码 15 · 文本 22 · 时间 11 · 安全 9 · 数值 18 · 开发 27 · 计算 18 · 网络 11 · 文件 8。

凡是能本地算的一律本地算：哈希/ HMAC / PBKDF2 / TOTP 走 WebCrypto，子网计算走位运算，Unix 时间戳与时区走 `Intl`，图片转 Base64 与文件哈希走 `FileReader`。没有一处把内容发到服务器。

`/tools/` 目录页由 `tools.js` 的注册表**自动生成**（`patch_round9.py` 解析 `TOOLS.push` 元数据），不手写、不维护第二份清单。

### 12.4 本轮踩到的坑

1. `sites_common.page()` 的返回值是**写入的文件路径**，不是 HTML。`/tools/` 目录页因此被写成了一个 47 字节的路径字符串——发现后改为「page() 已写盘，调用方只读回校验」。
2. DOM 桩环境下，工具卡片的 `build()` 里读 `<select>.value` 得到空串，导致单位换算 `Object.keys(undefined)`。修法是让工具自己兜底（`UNITS[catEl.value] || UNITS.len`），而不是把桩写得更假。
3. `main.js` 与 `sub.js` 曾各自绘制 `#sky` 星空，两套 `requestAnimationFrame` 同时跑。现在星空、主题、命令面板统一归 `sub.js`，`main.js` 只留 Releases 数据渲染。

## 13. 第五 / 六轮：侧站统一与极光层

### 13.1 侧站不再有第二套设计系统

`/xkmyth/`（发行仓）与 `/about/`（关于仓）此前仍是 v1 旧样式：自己一份 `style.css`、自己一套导航与页脚、自己一段星空。第五轮把它们对齐主站：

- 复制主站 `style.css` / `sub.css` / `sub.js` 到两个仓（Pages 是三个独立仓库，无法跨仓引 CSS）；
- 导航换成六项统一版（首页 / 软件库 / 工具 / Docs / 生态 / 状态，本页 `aria-current="page"`），页脚换成 `.foot-map` 四列；
- `<body>` 后插 `<canvas id="sky">`，`main.js` 里重复的星空段删除（星空/主题/命令面板只归 `sub.js`）；
- 补一层兼容样式（`.dl-*`、`.note-*`、`.rel-list`、`.badge.win/.apk/.iso`、`.guide-steps`），旧结构不改也能吃到 v2 的语言；
- 导航自链接补尾斜杠（`/about` → `/about/`），避免 GitHub Pages 302 丢 `aria-current`。

一致性靠脚本而不是靠自觉：`class_cover.py` 扫描页面里所有 `class="…"` 是否在样式表中有定义，两站从「缺 16 个 / 缺 2 个」跑到「缺 0 个」。

### 13.2 极光层与紧凑 Hero

`.hero-aurora` 在 v2 里早就定义了，但页面一直没插这个 div——所以只有 CSS 没有效果。第六轮补上：

- 三个 Hero 各插 `<div class="hero-aurora" aria-hidden="true"></div>`（18 秒缓慢漂移，`prefers-reduced-motion` 下动画关闭）；
- `.hero { isolation: isolate; overflow: hidden; }`——`isolation` 让 `z-index: -1` 的极光只落在 Hero 自己的层叠上下文里，不会钻到页面背景后面；
- 新增 `.hero.compact`：侧站不再吃满 96vh，首屏就能看到下载卡片/生态入口。

线上复验：`/` 13492B、`/xkmyth/` 11125B、`/about/` 8583B，三者都含 `hero-aurora`、`sub.js`、`#sky`、`foot-map`。

### 13.3 合并记录

| 仓库 | PR | merge sha |
| --- | --- | --- |
| xkmyth/xkmyth | #8（侧站 v2） | `b8a7eda81f7e4877eec28064992bc6132b788e84` |
| xkmyth/about | #4（侧站 v2） | `02e7037210cd4a72dcfb10d32c2b43d5db044774` |
| xkmyth.github.io | #7（极光层） | `ab9d06aa1df57ad517b88d2811f01bda9037fcaf` |
| xkmyth/xkmyth | #9（紧凑 Hero） | `f8e0a11ad5a71d143156fe942c9d64ab63dbeb36` |
| xkmyth/about | #5（紧凑 Hero） | `c91b17991b1671bfd308b2f44a55039aedc56046` |


## 14. 第七轮：工具详情页 · PWA · SEO · 可访问性

### 14.1 160 个工具详情页
- 路径 `/Timarsky/tools/<id>/`，共 139 页（6257–6609 字节/页），`<html data-tool="<id>">` 驱动 `tools.js` 的单工具模式（只渲染这一个工具，其余 `return`）。
- 每页结构：面包屑 → 标题区（eyebrow / h1 / 一句 lead / 复制链接 + 回列表）→ 左栏「就在这儿用」（真工具本体）+ 右栏四卡（什么时候用 / 怎么用 / 长得什么样 / 注意）+ 同类工具 + 上下一个。
- 结构化数据：`SoftwareApplication` + `BreadcrumbList`，canonical 与 OG 逐页生成；`/Timarsky/sitemap.xml` 141 条。
- 文案手写分批：`tool_docs_a.py`(35) / `tool_docs_b.py`(56) / `tool_docs_c.py`(29) / `tool_docs_d.py`(19)，每条含 `why` 场景、`ex` 输入→输出、`tip` 坑。

### 14.2 PWA（可安装 · 可离线）
- `/manifest.webmanifest`（全域）+ `/Timarsky/tools/manifest.webmanifest`（工具箱独立应用，`scope` 限 `/Timarsky/tools/`）。
- `/sw.js`：安装时预缓存 20 个核心资源；导航请求 network-first（断网回缓存、再断回 404）；静态资源 stale-while-revalidate；跨域与 `/api/` 直接放行。版本号 `xkmyth-2026-10-18`。
- 图标：`icons/icon-192.png`、`icon-512.png`、`icon-maskable-512.png`、`apple-touch-icon.png`、`favicon.png`、`icons/og-1200x630.png`（Pillow 绘制：竖向金渐变的星 + 高斯柔光，替代早期同心多边形造成的拉丝环）。
- 注册与安装引导在 `sub.js`（`xkmyth-pwa` 段）：仅 https/localhost、`?nosw=1` 可关；`beforeinstallprompt` 时在导航右侧长出「安装」按钮。

### 14.3 SEO
- `/sitemap.xml` 190 条（主站 47 页 + 404 + 工具站 2 + 139 详情页 + about + 发行仓），`/Timarsky/sitemap.xml` 141 条；`robots.txt` 同时列出两份。
- `/search-index.json` 189 条（页面 50 + 工具 139），命令面板与 `/search/` 共用同一份。
- 主站 `/tools/` 目录页的 139 个链接从锚点改成详情页真链接；全站补 `theme-color`（深/浅两套）、`apple-touch-icon`、`og:image` + `twitter:card`。

### 14.4 可访问性与性能
- 190 个页面统一加「跳到主内容」链接、`#main` 锚点 + `tabindex="-1"`、`:focus-visible` 金色描边、装饰画布 `aria-hidden="true"`、外链 `rel="noopener noreferrer"`、`<meta name="color-scheme">`。
- `prefers-reduced-motion` 下动画时长归零；星空/极光/命令面板统一由 `sub.js` 提供，页面不再各自带一份。

### 14.5 校验
- `verify_all.py`：发行仓 1 / 主站 47 / 关于 1 / 工具站 141 页，0 错误；工具 139、目录页链接 0 缺失、详情页 0 缺失。
- `test_single_mode.js`：9 个代表工具（b64/ts/calc/mdtable/tts/vlsm/chmod/img2b64/totp）单工具模式 9/9 PASS。
- `check_detail_css.py`：详情页 32 个类名在 `tools.css` 中 0 缺失。
- `audit_a11y.py`：0 个页面缺 `#main`，0 条外链缺 `rel`。

### 14.6 踩坑
- 详情页内联脚本调用 `window.toast` —— `tools.js` 的 `toast` 是闭包内私有变量，页面只有 `#toast` 元素；改成页面自带 `tip()` 写 `#toast`。
- 单工具模式测试里 `$()` 走 `document.querySelector`，桩必须按 `#id` 返回**同一个**元素，否则卡片被挂到孤儿节点上、断言 0 卡片。
- `verify_all.py` 原先用 `#tool-<id>` 判目录页链接，改链详情页后误报 139 处，改成「详情页链接或锚点任一存在」。
- 详情页自带 `twitter:card: summary`，`pwa_files.py` 又补了一条 `summary_large_image`：重复但后者生效，后续若清理以 `summary_large_image` 为准。


## 15. 第八轮：站务日志独立成页 + 全站结构化数据（2026-10-18）

### 15.1 站务日志
`/blog/` 原来把四篇长文塞在一个列表页里，既搜不到也不便引用。现在一篇一页：

| 路径 | 主题 | 结构 |
| --- | --- | --- |
| `/blog/static-first/` | 为什么整个生态是静态站 | 日期徽标 + 正文 + 上下篇 + 相关文档 |
| `/blog/tools-not-decoration/` | 160 个工具怎么保证不是摆设 | 同上 |
| `/blog/ci-gbk-incident/` | CI 抓到的一次真实事故 | 同上 |
| `/blog/apps-same-bottom-line/` | 十个应用共用一条底线 | 同上 |

列表页 `/blog/` 保留摘要与日期，标题改成指向独立页；新增 `/blog/feed.xml`（RSS 2.0，四篇，`atom:link` 自引用），页面 `<head>` 里挂 `rel="alternate"` 订阅链接。

### 15.2 结构化数据
194 个页面统一补齐 `canonical` + `application/ld+json`，按页面类型选 schema：

- 工具详情页（`<html data-tool="…">`）→ `SoftwareApplication`（含 `offers.price = 0`、`isPartOf` 工具箱）+ `BreadcrumbList`
- 软件库应用页 → `SoftwareApplication` + `BreadcrumbList`
- 站务日志文章 → `BlogPosting`（`author` / `publisher` / `datePublished`）+ `BreadcrumbList`
- 其余 → `WebPage` + `isPartOf: WebSite` + `publisher: Organization`

首页不出面包屑（自己不指向自己）。`og:type`、`og:image`（1200×630）、`twitter:card` 沿用第七轮的口径。

### 15.3 索引口径
`sitemap.xml` 194 条、`search-index.json` 193 条（页面 50 + 工具 139 + 四个外部仓入口）、`robots.txt` 双 sitemap（主站 + 工具站）。

### 15.4 踩坑
1. **URL 不能拿路径拼**：第一版 `page_url()` 把 `os.path.relpath` 的结果往仓库目录上怼，结果 `canonical` 变成 `D:\xkmyth-eco\xkmyth.github.iocontact/`。改成 `url_of(base, rel)` 只吃「URL 前缀 + 相对路径」（D22）。
2. **面包屑 URL 累加手滑**：逐段累加时把最终页的 URL 写进了中间层（`/Timarsky/tools/vlsm/` 冒充 `/Timarsky/tools/`），重写为 `acc = acc + seg + "/"`。
3. **h1 取词不要插空格**：`re.sub(r"<[^>]+>", " ", html)` 会把 `xk<span>myth</span>` 变成 `xk myth`，取纯文本要用空串替换。

### 15.5 校验
`verify_all.py`：发行仓 1 + 主站 51 + 关于 1 + 工具站 141 = 194 页，错误 0；JSON-LD 194 处全部可解析；`href/src` 里出现盘符 0 处。


## 16. 第九轮：场景化合集 + 富结果结构化数据（2026-10-18）

### 16.1 工具合集 `/collections/`
160 个工具按九类分好，但找工具时人想的是「我现在要干什么」。新增八组合集，每组按真实动手顺序排：

| 合集 | 工具 | 说明 |
| --- | --- | --- |
| 上线前十分钟 | json · diff · hash · crc32 · httpstatus · mime | 发版前自检 |
| 写文档与说明 | mdtable · outline · csv2md · slugify · htmlent · lorem | 排版与样例 |
| 排线上问题 | urlparts · qsparse · jwt · hexdump · unicode · ts · tz | 字符串里找线索 |
| 账号与密码 | pwd · passphrase · entropy · totp · hmac · policychk | 全部本地计算 |
| 网络与子网 | cidr · vlsm · ipv4conv · ipv6expand · iprange · portinfo · macfmt | 划网段 |
| 钱与数 | percent · compound · loanrate · profit · unitcost · rmbcap · tip | 口径写进结果 |
| 文本急救 | dedupe · sortlines · trimlines · stripzero · textclean · findrep · cap | 粘来的文本收拾干净 |
| 编码与转义 | b64 · base32 · url · unicode · uniesc · jsstr | 定位是哪一层改写了字符 |

八组合计 52 处引用、去重 51 个工具。页脚 52 页、首页 `#sites`、工具目录、生态地图都挂了入口。

### 16.2 富结果结构化数据
在通用 `WebPage` 之外，给「能被搜索引擎当卡片展示」的页面单独加了 schema：

- `/faq/` → `FAQPage`，12 组问答直接从页面 `details` 抽取（问题取 `summary`，答案取正文，去标签去实体）；
- `/guide/` → `HowTo` 四步（挑包 → 校验 → 解压安装 → 接自己的云）；
- `/docs/install/` → `HowTo` 三步（解压 → 放行 → 建快捷方式）；
- `/tools/` → `ItemList` 139 项；`/software/` → `ItemList` 10 项；`/collections/` → `CollectionPage` + 八项列表。

这些脚本带 `data-kind` 属性，与第七轮注入的通用 JSON-LD 互不干扰（后者用无属性选择器清理，前者按 `data-kind` 原位替换）。

### 16.3 站务日志补到六篇
新增两篇长文：`/blog/pwa-not-just-manifest/`（manifest scope、三类缓存策略、更新时机）、`/blog/tests-before-139-tools/`（注册/渲染分离、DOM 桩、环境噪音分桶、修工具不修桩）。`/blog/feed.xml` 改为扫描文章页重建，`pubDate` 用标准 RFC822。

### 16.4 数字口径交给脚本
`/stats/` 与首页 hero 规模条改由 `refresh_stats.py` 重算：站点页数（排除 404）、HTML 总体积、样式/脚本数量与体积、应用数、工具数。同时 `fix_counts.py` 把全站「N 个入口」统一成实际页数（本轮 53）。

### 16.5 踩坑
1. **脚本文案会过期**：`46 个入口` 在加了两篇文章后就不对了，所以口径必须由脚本写，不能手写（D26）。
2. **选择器要按真实 DOM 写**：软件库卡片是 `<div class="site-name">` 不是 `<span>`，写错就整段跳过 —— 富结果脚本现在每条都打印命中数量，为 0 即报错。
3. **`S.page()` 已自带 canonical / OG / skip-link**：新页面自动合格，历史页面靠补丁对齐，两套并存时要按 `data-kind` 区分来源。

### 16.6 校验
`verify_all.py`：发行仓 1 + 主站 54 + 关于 1 + 工具站 141 = 197 页，错误 0；JSON-LD 全部可解析（含 FAQPage/HowTo/ItemList）；`sitemap.xml` 197 条、`search-index.json` 196 条。


---

## 18 · 第十一轮：工具箱扩到 160 个（batch3）

### 18.1 这一轮加了什么

| 分类 | 新增 | 工具 id |
| --- | --- | --- |
| 安全 | 4 | aesgcm（AES-GCM 加解密）、jwtgen（HS256 签发）、otpauth（认证器链接）、pwhash（PBKDF2 成本演示） |
| 时间 | 3 | agecalc（周岁/下次生日）、workdays（工作日推算）、countdown（还剩几天） |
| 网络 | 3 | ipv6cidr（IPv6 子网）、wol（魔术包）、urltemplate（模板填参） |
| 数字 | 3 | bitshift（位运算视图）、bytesize（KiB/KB 换算）、percentile（分位数/IQR） |
| 开发 | 4 | gitignore（生成规则）、envjson（.env ↔ JSON）、sqlinsert（CSV → INSERT）、magic（文件头识别） |
| 文件 | 2 | b64file（base64 → 文件）、textfile（文本存文件，可加 BOM） |
| 文本 | 2 | nato（NATO 拼读）、spellout（数字转英文单词） |

合计 21 个 → 工具箱 139 → **160**，分类分布 time 14 / enc 15 / text 24 / safe 13 / num 21 / dev 31 / calc 18 / net 14 / file 10。

### 18.2 流程（每批都照这个走）

1. 写 `tools_batch3.js`（注册段风格与 batch2 一致，`t2def` / `t2text` / `t2form` 复用）；
2. `add_batch3.py`：插到 `/* ---------------- 渲染 ---------------- */` 之前 → `node --check` → 正则解析注册表 → `tools_meta.json`；
3. 目录页按注册表重建（带搜索框与 `data-search`），详情页由 `gen_toolpages.py` 重生成（160 个 + Timarsky sitemap 162 条）；
4. `seo_round.py` 重建 `search-index.json`（218 条）与主站 `sitemap.xml`（219 条）；
5. `refresh_stats.py` 重算 `/stats/` 与首页规模条；
6. `smoke_tools.js` 全量跑一遍（160 个，0 真实问题），新增工具逐个跑 `test_single_mode.js <id>`（21/21 PASS）；
7. `verify_all.py` + `scan_dup_id.py` 过闸。

### 18.3 三条踩坑

- **文案要一次补齐**：`gen_toolpages.py` 对缺文案的工具会回落成通用句子，看起来像模板。第三批 21 条 why/ex/tip 全部手写在 `tool_docs_e.py`。
- **数字散落各处**：`139` 出现在页面文案、目录页、`sites_common.TOOL_COUNT`、`search-index`、sitemap 与文档里。这次用 `fix_counts3.py` 全站替换并 `scan_toolcount.py` 复查，避免只改到一半。
- **历史文章不要改数字**：`/blog/tests-before-139-tools/` 标题里的 139 是当时的实况，改标题反而失真；正确做法是正文末尾加一条「补记」说明后来涨到 160。

### 18.4 校验结果

`verify_all.py`：发行仓 1 + 主站 55 + 关于 1 + 工具站 162 = **219 页，错误 0**；`scan_dup_id.py` 重复 id 0；`smoke_tools.js` 工具总数 160 / 真实问题 0；`test_single_mode.js` 新增 21 个全 PASS。


---

## 19 · 第十二轮：可推广性与长页性能

### 19.1 分区分享图

`D:\xkmyth-eco\_tools\og_sections.py` 用 Pillow 生成 9 张 1200×630 分区 OG 图（`icons/og-tools.png`、`og-software.png`、`og-docs.png`、`og-blog.png`、`og-ecosystem.png`、`og-status.png`、`og-collections.png`、`og-lab.png`、`og-changelog.png`），风格与站点一致：深空渐变 + 双极光 + 金色渐变星 + 标题/副标题/域名。`og_meta.py` 遍历四仓 164 个页面，按路径前缀挑图并补齐 `og:type/site_name/title/description/url/image(+宽高)` 与 `twitter:card/title/description/image`，已有标签不覆盖。

### 19.2 长页性能

`sub.css` 给 `.cat-sec`、`.tool-grid .tool-link`、`.site-grid .site-card`、`.tl-item` 加 `content-visibility: auto` + `contain-intrinsic-size: auto 220px`；`prefers-reduced-motion` 下退化为 `visible`。160 张工具卡与 9 个分类区块不再在首屏一次性布局。

### 19.3 三个小交互

- 详情页「长得什么样」卡片右上角加「复制示例」按钮（`#copyEx` 读 `#exText` 文本，`navigator.clipboard` 失败回退 `execCommand`）；
- 工具目录页 chips 末尾加「🎲 随机一个」，从当前可见工具里抽一个跳转；
- 51 个详情页补「这套流程里的其他工具」侧栏卡，数据来自八组合集反查（`flow_links.py` 直接 import `gen_collections.COMBOS`，不另存一份映射）。
- 6 个博客页在 `<head>` 补 `<link rel="alternate" type="application/rss+xml" href="/blog/feed.xml">`。

### 19.4 校验

`verify_all.py` 219 页 0 错误；`scan_dup_id.py` 0；`check_html.py` 工具站 162 页 0 错误。

## 20 · 第十四轮：品牌包、实测体积、浅色可读性、搜索质量

### 20.1 品牌包

`_tools/gen_press_kit.py` 生成两样东西：

- `icons/logo.svg`：1041 字节的矢量标识，深底为设计基准（金色渐变星 + 细描边）；
- `brand/xkmyth-brand.zip`：287 KB，含 `README.txt`（用法 / 允许与禁止 / 配色 / 字体）、`logo.svg`、三档 PNG 图标、分享图与 favicon。

`/brand/` 页面新增「下载品牌包」小节：一个下载按钮、一个 logo.svg 直链、四张预览图。写素材给别人的时候不用再自己抠图，也顺手把「不许改成自家图标」这类边界写在包里。

### 20.2 实测体积

`_tools/gen_benchmark.py` 不走「估算」：直接读文件、用 zlib 9 级压缩模拟服务器 gzip，把七个资源与六个关键页的原始 / gzip 后体积写进 `/benchmark/`。这样页面上的数字永远和仓库里的文件一致，改完样式跑一遍脚本就更新。

### 20.3 浅色主题的可读性

`_tools/audit_contrast.py` 按 WCAG 2.1 算 14 组前景 / 背景组合。深色主题全过；浅色主题暴露三处真问题：`--mint` / `--rose` / `--violet` 在 `html[data-theme="light"]` 里没有覆盖，仍是深色主题的浅色调，对比度只有 1.36 / 1.69 / 1.65（正文要求 4.5、图形要求 3.0）；金色 `#b45309` 在 `--bg1` 上是 4.49，差一点点。

`_tools/patch_contrast.py` 把浅色 token 改成 `#047857` / `#be123c` / `#6d28d9`，金色改 `#9d470a`。修复后：mint 4.90、rose 5.62、violet 6.35、金 5.62 / 5.93，14 组全部达标。

### 20.4 工具箱的浅色模式

工具站 160 个工具页此前**完全没有主题开关**：工具箱主页有 `body.light`，`/tools/` 却是纯深色，用户切到浅色再进工具箱会突然变黑。

`_tools/patch_tools_theme.py` 三件事：

1. 161 个页面 `<head>` 内联一段预判脚本，读 `localStorage['xkmyth-theme']`，是 light 就给 `<html>` 加 `theme-light`（放在样式之前，防闪烁）；
2. `tools.css` 追加 `html.theme-light` 覆盖：整套 token + 头部背景 + 星空的浅色渐变 + 输入框 / 输出框 / 卡片 / 表格 / diff 的浅色底与边；
3. `tools.js` 末尾加主题模块：在 `.header .nav`（详情页回落 `.tp-actions`）里长出一个 `.theme-btn`，点击切换并写回同一个 localStorage 键。

### 20.5 搜索质量

两件事分开做：

- **索引补词**（`_tools/enrich_search.py`）：160 个工具各给一份别名表（`timestamp` / `房贷` / `github ignore` 这类用户真会输入的说法），再从手写文案里摘 `why` / `ex` / `tip` 前 70 字并入 `kw`；42 个页面补中英别名。索引从 218 条 / 73.9 KB，仍然是一次请求。
- **打分升级**（`_tools/patch_search2.py` + `patch_search3.py`）：原来只做整串子串匹配，`github ignore`、`json 格式化` 这类多词查询直接零结果。新逻辑：整串命中按位置给分（100 / 82 / 64 / 46 / 34），多词查询要求每个词都命中（标题命中越多分越高），中文查询再用「相邻两字」兜底，最后才是子序列。

### 20.6 校验

- `verify_all.py`：发行仓 1 + 主站 55 + 关于 1 + 工具站 162 = 219 页，0 错误；
- `smoke_tools.js`：160 个工具注册与构建 0 真实问题；`test_single_mode.js` 抽样 9/9 PASS；
- `test_search.py`：20 条真实查询（含 `github ignore`、`对比度 wcag`、`时区`）全部有结果。

### 20.7 踩坑

- **拉丁字符串也会被中文双字兜底命中**：`sitemap`、`github ignore` 最初返回一堆无关页面，因为 `gi` / `si` 这类两字母窗口在英文标题里到处都是。修法：双字兜底只对含 CJK 字符的查询启用。
- **幂等守卫别用前缀判断**：`patch_search2.py` 拿新旧函数的前 60 字符比较，而两者开头完全相同，导致误判「已改」而静默跳过。改成检查改动特有的注释文本。
- **`--mint` 这类「只在深色定义的变量」在浅色主题里不会报错**，只是难看且不可读；对比度审计要按主题分别跑。

## 21 · 第十五轮：工具箱快速跳转、离线清单、为什么不拆包

### 21.1 快速跳转（详情页）

160 个工具详情页此前只能靠浏览器后退或回目录页找下一个工具。`_tools/patch_tools_jump.py` 给 `tools.js` 加了一个轻量跳转器：

- 头部导航里长出一个 `⌕` 按钮；`/` 或 `Ctrl/Cmd + K` 也能唤起；
- 浮层里一个输入框 + 前 12 条结果，标题前缀 90 / 包含 70 / 描述与分类命中 45；
- `↑↓` 选择、`Enter` 打开、`Esc` 关闭，点击遮罩也能关；
- 目录页自己已经有搜索框，脚本里用 `document.getElementById('tsearch')` 判断，命中就直接不初始化（避免两套搜索抢 `/` 键）。

`_tools/test_quickjump.js` 只抽这一段 IIFE 跑桩环境：注册监听、按钮落位、`/` 打开、空查询列全部、`Esc` 关闭，全过。

### 21.2 离线清单

`sw.js` 的 `VER` 改成 `xkmyth-2026-10-18b`（改资源就改版本，`activate` 时旧的整包删掉），`CORE` 从 20 项扩到 24 项，补了 `/collections/`、`/brand/`、`/lab/motion/`、`/benchmark/`。

### 21.3 为什么 160 个工具还是一个 tools.js

`tools.js` 现在 273 KB 原始 / 78 KB gzip。看着像该拆包，但按实际访问路径算不划算：

- 绝大多数人是先从 `/Timarsky/tools/` 目录页进来，那一页无论如何都要全部 160 个工具的名字与分类，拆包也省不掉；
- 从目录页点进详情页时 `tools.js` 已经在缓存里，拆包反而多一次请求；
- 真正付代价的只有「被人直接深链到某个工具页」这一种，代价是一次 78 KB gzip 下载，之后一直被缓存。

结论：不拆。等哪天工具数上 400 或者出现「详情页首屏必须 < 1s」的硬指标，再按分类拆文件。

### 21.4 踩坑

- 桩环境里 `parentNode` 得真的接上（`appendChild` 时赋值、`removeChild` 时清空），否则 `box.parentNode.removeChild(box)` 这类真实 DOM 一定成立的代码在测试里会假报错。修桩，不修代码。

## 22 · 第十六轮：内容补齐与数据收口顺序

### 22.1 站点更新日志补到第十五轮

`/changelog/` 的「站点更新」段此前只写到第十轮。这一轮把 11–15 轮补上，每条都写清楚「改了什么、为什么改」，不是流水账：

- 第十一轮：动效实验室、键盘帮助、表格与画布的语义补全；
- 第十二轮：第三批 21 个工具、160 个工具的三件套纪律；
- 第十三轮：九个分区分享图、`content-visibility`、示例复制、品牌包、实测体积；
- 第十四轮：浅色主题的三个强调色换色（1.36 → 4.90 那件事）、工具箱补主题、搜索关键词与多词打分；
- 第十五轮：工具箱 `⌕` 快速跳转、离线清单扩项、SW 版本递增。

### 22.2 第七篇日志

`/blog/light-theme-is-not-a-filter/`：把「浅色主题不是反色」这件事从头写了一遍 —— 对比度怎么算、四个不达标的色号、工具箱为什么完全没有主题、搜索关键词为什么要当数据管。附带二十条验收查询的思路。

### 22.3 数据收口的顺序（新的硬规矩）

这一轮踩到的：跑完 `enrich_search.py`（补关键词）之后又跑了 `seo_round.py`（重建索引），关键词被整份覆盖，`kw` 最长从 240 字符掉回 54。表现不是报错，而是「搜索变得不好用了一点」——最难发现的那类退化。

因此固定顺序与入口：

```
finalize_site.py
  1. refresh_stats.py   页面数/体积 → /stats/ 与首页规模条
  2. seo_round.py       目录页链接、索引基础条目、sitemap、robots
  3. enrich_search.py   关键词补词（必须最后）
  4. 断言：count ≥ 200、kw 最长 > 100
```

任何「改完还要重建索引」的脚本，都从 `finalize_site.py` 走，不要单跑中间步骤。

## 23 · 第十七轮：第十一个应用 —— 本地数据台账 XK Data

### 23.1 为什么做这个

十个自研应用各自往 `localStorage` 里写字，加起来有九个键。用户看不到它们，也没法整体带走或整体清空 —— 这在「数据只在你本机」的叙事里是个洞里：**你没法验证这句话**。

`/software/data/` 解决三件事：

1. **看得见**：运行时遍历 `localStorage`，列出所有以 `xk-`、`xkmyth-` 开头的键，按体积从大到小排，每行给用途名、真实字节数、类型徽标（应用数据 / 偏好设置 / 站点缓存 / 未登记）。
2. **带得走**：单键导出 `{key, value, exportedAt}`；「导出全部」出一个 `xk-my-data-<日期>.json`，键名做 key。
3. **清得掉**：单键清空（带 `confirm`）、「清理站点缓存」（只删可重建的缓存，不碰应用数据）、「全部清空」（连点三下才生效，防误触）。

### 23.2 实现要点

- 体积用 `new Blob([value]).size` 算 UTF-8 真字节，不用 `value.length`（中文一个字三字节，差三倍）；
- 用途表是**数据**：`META` 里登记已知键，未知但前缀匹配的也会列出来，标成「未登记」（红色徽标）—— 宁可显示不认识，也不隐藏；
- 只动 `xk-` / `xkmyth-` 前缀的键，页面上写明了这一点，测试里也有一条断言守着；
- 额度按 5 MB 粗算，显示占用百分比；
- 切标签页回来（`visibilitychange`）或别的页面 `storage` 事件时重新读一遍。

### 23.3 验收

`_tools/test_data_app.js` 用桩环境跑真交互，18 项断言全过：只统计本站前缀、用途名可读、按体积排序、类型徽标、全部导出内容正确且不含无关键、清缓存不碰应用数据、全部清空必须三击、不碰别人的键。

同一轮把 `APP_COUNT` 改成 11，`/software/` 目录、首页软件库区、`/stats/`、`/press/` 的数字随脚本重算。
