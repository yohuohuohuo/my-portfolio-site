# HANDOFF.md

## 当前快照

日期：2026-07-12
项目根目录：`/Users/qiuyupan/git_workspace/my-portfolio-site`
分支：`codex/portfolio-migration`

当前开发预览：`http://127.0.0.1:3000/`

本仓库已从 Mint Forest 前端改造成个人作品集结构。`/` 是最小入口，`/mint-forest` 是本地化交互子作品。作品集入口也支持只配置外链的项目卡片。当前没有 push、merge、rebase、发布或部署动作。

## 2026-07-15 高级前端面试指南 V2

- 在 `docs/interview/v2/` 新增 Markdown-only 的第二版面试文档集：入口说明、24 个 P0 作战问题、真实项目与 8 个 STAR 故事槽位、扩展技术题库、面试当天一页速查、通用 / Web3 两条 JD 定向复习路径。
- V2 使用 `[候选人确认]`、`[简历事实]`、`[源码可证]`、`[通用原理]`、`[设计提案]`、`[待补 STAR]` 区分证据来源；未补齐的行为事件统一保留 `[待本人补充]`，不得作为真实经历直接使用。
- 原有 `docs/interview/高级前端开发工程师面试指导.md`、DOCX 和 `generate_interview_guide.py` 保持不变，继续作为完整历史题库；V2 不生成 DOCX。
- 设计规格：`docs/superpowers/specs/2026-07-15-senior-frontend-interview-guide-v2-design.md`；执行计划：`docs/superpowers/plans/2026-07-15-senior-frontend-interview-guide-v2.md`。
- 本次没有修改应用代码、runtime、依赖、构建配置或测试。静态文档验收和最终本地提交结果见本轮交付记录；禁止 push、merge、rebase、发布和部署的边界不变。

## 2026-07-14 外链项目卡片

- 作品集入口新增 5 个 config-only 外链项目：NFTScan、NFTScan Site、Mint Blockchain、PengoPay、10XProtocol Alpha。
- 外链项目只改 `src/portfolio` 配置和卡片渲染，不引入对应项目源码，也不新增站内路由。
- 外链卡片使用本地封面素材：`public/projects/portfolio/nftscan.png`、`nftscan-site.png`、`mintchain.png`、`pengopay.png`、`10xprotocol.png`。10XProtocol 卡片使用用户提供的桌面端截图作为本地封面，不产生外部图片请求。
- `scripts/audit-runtime-dependencies.mjs` 的 NFTScan 禁用规则已收窄到 Mint Forest runtime 路径，避免误伤作品集外链配置；Mint Forest 运行时仍不得依赖 NFTScan。
- 新增 E2E 断言验证 5 个外链项目均显示为 `target="_blank"` 的 outbound link，并明确验证 10XProtocol 卡片的 `img[src]` 为 `/projects/portfolio/10xprotocol.png`。

本次验证：

```text
npm run test:unit                                      3 test files, 18 tests passed
npm run verify:runtime                                Runtime dependency audit passed
npx tsc --noEmit                                      passed
npm run build                                         exit 0; Next static generation completed
npm run verify:routes                                 Route verification passed (6 routes)
npm run test:e2e -- tests/e2e/portfolio.spec.ts --reporter=line --timeout=30000
                                                        desktop/mobile 6/6 passed
npm run verify:runtime                                Runtime dependency audit passed
npx tsc --noEmit                                      passed
```

本次封面替换已在 `1440x900` 和 `390x844` 本地浏览器中检查。10XProtocol 图片已成功解码为 `826x410`，卡片封面显示正常。

已知提示仍与此前一致：npm 输出 `.npmrc` 的 `strict-peer-dependencies` warning；Playwright webServer 输出 npm env `-authtoken` warning；Next build 输出仓库未安装 ESLint 的提示，但 build exit 为 `0`。

## 2026-07-14 Portfolio Lanyard And Chroma Grid

- `/` 已改为暗色作品集入口。顶端 `PortfolioFeatured` 每次完整加载后仅从 `src/portfolio/config/projects.ts` 的 `projects` 配置随机选择一个项目；选择值只保存在 React state，不写入 browser storage。
- desktop（`min-width: 768px` 且未启用 reduced motion）挂载 client-only `PortfolioLanyard`。它以本地 `/projects/portfolio/lanyard/card.glb` 和 `lanyard.png` 为模型/纹理，并把所选项目的本地 cover 合成到 badge 两面；模型、项目图片和 Canvas 外的 CTA 均不产生远程请求。
- mobile 和 `prefers-reduced-motion: reduce` 完全不挂载 Canvas、Rapier world 或 GLB；使用同一 selected project 的静态 featured card，保留封面、名称、描述、tags 与内部/外链 CTA。
- 项目网格使用 `ChromaProjectGrid` 的 GSAP pointer interpolation 和灰度 radial mask。desktop fine-pointer hover 时，当前 card 写入 `data-chroma-active="true"`、恢复局部颜色并显示稳定色相的边框/高光；mobile、coarse pointer 和 reduced motion 保持静态且所有链接可用。
- 新增依赖：`three`、`@react-three/fiber`、`@react-three/drei`、`@react-three/rapier`、`meshline`、`gsap`。Yarn 安装过程中出现临时 cache 损坏；最终使用独立 temp cache 完成安装，`package.json` 与 `yarn.lock` 已正常写入。

2026-07-14 视觉细化：

- Featured hero 改为完整 `1px` 边框与 `12px` 圆角；Lanyard 镜头调整为 `fov: 12`，固定挂点上移，项目牌、碰撞体和关节锚点等比放大，并以 `x: 2.65` 锚定在 hero 右侧空白区。
- Chroma 静止遮罩从纯灰的 `grayscale(1)` 调整为 `grayscale(0.42) saturate(0.72) brightness(0.78)`，保留低饱和封面色彩，hover 仍恢复焦点区域的原始颜色。
- Lanyard GLB、纹理与两帧物理首帧完成后，由 `PortfolioFeatured` 给受控 `portfolio-lanyard` 容器写入 `data-lanyard-ready="true"`；E2E 在该状态后检查 Canvas RGB channel range 大于 `24`，避免把资源加载中的空 framebuffer 误判为渲染成功。
- `portfolio-lanyard` 还声明 `data-lanyard-placement="right"`，用于回归验证 desktop 右侧锚定；移动端仍不挂载该容器或 Canvas。

本次验证：

```text
npm run test:unit                                      4 test files, 19 tests passed
npm run verify:routes                                  Route verification passed (6 routes)
npm run verify:runtime                                 Runtime dependency audit passed
npx tsc --noEmit                                       passed
npm run build                                          exit 0; static generation completed
npm run test:e2e                                       25 passed, 1 skipped
npm run test:e2e -- tests/e2e/portfolio.spec.ts        desktop/mobile 10/10 passed
npx tsc --noEmit                                       passed after visual refinement
npm run test:unit                                      4 test files, 19 tests passed
npm run verify:runtime                                 Runtime dependency audit passed
npm run verify:routes                                  Route verification passed (5 routes)
portfolio Lanyard targeted E2E                         desktop/mobile 2/2 passed; ready + Canvas pixel range + mobile fallback
portfolio visual baseline targeted E2E                 desktop 1/1 passed; mobile skipped by design
Mint Forest direct-route targeted E2E                  desktop/mobile 2/2 passed
```

视觉证据：desktop Lanyard Canvas 断言 `data-engine` 包含 `three.js`，并截取了 Lanyard/Chroma hover 截图；Canvas screenshot RGB standard deviation 为 `28.6-31.0`，不是空白单色输出。`1440x900` 检查中 Lanyard、语义 CTA 与项目 grid 文本均可见；`390x844` 检查中没有 Lanyard Canvas，静态 featured 和外链 CTA 正常。测试截图位于临时 `test-results`，不属于提交内容。

新增依赖的 Yarn peer 提示：Drei 的部分 transitive package 声明 `@types/three` peer；Yarn 已安装 `@types/three`。已有 npm `.npmrc`、Playwright `-authtoken`、`NO_COLOR/FORCE_COLOR` 以及 build 缺少 ESLint 的提示仍存在，均未导致命令失败。

本次没有重跑 `npm run build`：用户的 `127.0.0.1:3000` dev server 正在同一工作树中运行，build 会与 `.next` 产物冲突。3100 E2E dev server 曾短暂清理 `/mint-forest` 的开发产物，使 3000 返回 404/500；已通过 Mint Forest 定向 E2E 重新生成该页面，并确认 `http://127.0.0.1:3000/mint-forest` 恢复为 `Mint Forest Demo`。后续应在隔离副本运行全量 E2E/build，或先停止 3000 dev server。

## 2026-07-12 样式工具链迁移

- 已修复 `react-modal` Portal 的主题变量作用域：Mint tokens 现在由 `body:has(.mint-forest-root)` 提供，因此挂在 `document.body` 的任务弹窗可以解析 `bg-background-lv1`。
- 所有 Sass 文件已转换为标准 CSS 或 CSS Module；仓库没有 `.sass`、`.scss` 或 `*.module.scss` 文件，也没有 `sassOptions`、`sass` 依赖或 `tailwind.config.js`。
- Tailwind CSS 已升级到 v4，使用 `@tailwindcss/postcss` 和 `postcss.config.mjs`；`autoprefixer` 已移除。PostCSS 仍是 Next.js 处理 Tailwind v4 的必要构建步骤。
- 旧 Tailwind spacing、颜色、字体、圆角和阴影已迁移到 `src/styles/globals.css` 的 `@theme`。其中 `--spacing: 2px` 与 `--spacing-275: 450px` 保持原有 numeric utility 尺寸。
- 为 v4 改写了旧 utility：`bg-gradient-to-*` -> `bg-linear-to-*`、`bg-opacity-50` -> `bg-black/50`、`flex-shrink-0` -> `shrink-0`。
- 新增 Task Portal 回归断言，验证计算背景为 `rgb(49, 133, 222)`，覆盖本次发现的变量继承缺陷。

不要在同一工作树中同时运行 `next dev` 和 `next build`/`next start`：它们共享 `.next`，会造成缺失 chunk。需要 production E2E 时，先停止 dev server，或在隔离副本中 build/start。

## 2026-07-14 背包资源映射与审计

- 已修复 `BackPackView` 的本地宝箱图映射：local demo fixtures 使用 `boxId` `501`、`502`，现在分别解析为 `pic-signin-box.png`、`pix-event-box.png`；此前残留的旧 ID `1`、`4` 会触发 `CommonImg` 的默认图 fallback。
- `tests/e2e/mint-forest-actions.spec.ts` 现在在 desktop/mobile 背包流程中断言两张 seeded 宝箱图的准确 `src`，并确认浏览器已成功解码图片（`naturalWidth > 0`）。
- 已审计 `src` 中全部 `41` 个 `/projects/mint-forest/...` 图片、SVG 与音频引用：对应 `public` 文件均存在；隔离 dev server 上逐个 HTTP 请求也全部返回 `200`。源码没有远程图片、音频或 SVG URL。
- 本机存在两个预览注意项：`127.0.0.1:3000` 的长期 dev server 有 stale Next client bundle，干净 Playwright context 可能停在加载层；`127.0.0.1:3100` 已被一个无响应的旧 dev process 占用。未终止这些未知进程，以免影响用户当前预览；验证使用隔离副本的 `127.0.0.1:3102` 完成。

当前 HEAD：

```text
f3b98d2 test: enforce local Mint Forest runtime boundary
be516a1 refactor: finish local Mint Forest runtime isolation
9587379 refactor: replace wallet and chain flows
595001c refactor: use local session and read gateway
25636a5 feat: add local Mint Forest compatibility gateway
5b5f03b feat: add deterministic Mint Forest state core
ac6d5f5 feat: add portfolio routes and isolate Mint Forest
cc031f7 test: add migration verification toolchain
d6e86fa chore: establish sanitized source baseline
```

Task 8、Task 9、Task 10 的代码已通过阶段性本地 commit 保存；当前未执行任何远程 Git 操作。

## 已完成结构

- `src/pages/index.tsx`：作品集入口。
- `src/pages/mint-forest/index.tsx`：薄路由。
- `src/portfolio/config/projects.ts`：子作品注册配置。
- `src/projects/mint-forest`：Mint Forest 全部运行时代码。
- `public/projects/mint-forest`：Mint Forest 本地字体、图片、SVG、音乐和地图资源。
- `src/shared`：已删除；没有 `@/shared` import。
- `_app.tsx`：只保留全局 CSS、字体和中性 metadata；Alert 已移动到 Mint Forest 根组件。
- `_document.tsx`：只保留 Next 基础文档结构；Analytics、reCAPTCHA 和外部脚本已删除。
- `playwright.config.ts`：固定 `workers: 1`，避免多个浏览器 worker 同时触发 Next dev server 编译导致 desktop 回归不稳定。

## 数据与运行时合同

- Gateway：`src/projects/mint-forest/data/mint-forest.gateway.ts`。
- Repository：`src/projects/mint-forest/data/local-storage.repository.ts`。
- Rules：`src/projects/mint-forest/data/demo-rules.ts`。
- Store：`src/projects/mint-forest/store/use-mint-forest-store.ts`。
- Storage key：`portfolio:mint-forest:v1`。
- Session：`demo-session-v1`、Demo ID `1001`。
- 固定规则：初始 `2400 MF`，daily `+120`，invite `+80`，steal `+60` 且每个目标只成功一次、总计最多三次；spin 成本 `100`，奖励序列 `[500, 50, 200, 1000, 100]`；box `501/502` 奖励 `150/250`；task `2/3/4/6` 奖励 `50/50/100/80`。
- 所有 mutation 通过 repository 写入，再由项目 store 同步；业务组件不直接读写 browser storage。

## 外部边界清理

运行时和静态审计已移除或禁止：

- RainbowKit、wagmi、viem、WalletConnect、ethers、ABI、合约执行方法。
- Mint Forest API/CDN、Mint Chain RPC/explorer/bridge/swap、NFTScan。
- Axios、Twitter SDK、Discord OAuth、Google Analytics、reCAPTCHA。
- `src/shared`、`staticUrl`、`greenIdTokenUrl`、`BaseApi` 和直接 `localStorage`。

当前 `yarn.lock` 不再包含四个已删除的直接依赖：`@napi-rs/canvas`、`big.js`、`svg-path-properties`、`@types/big.js`。旧 Web3 包的不可达 lock entries 仍可能存在，但不再由 `package.json` 路径引用；它们不属于运行时安装图，后续可在有可用 Yarn registry 时生成一次干净 lockfile 进一步收缩。

## 已验证证据

已通过：

```text
npm run test:unit       3 test files, 18 tests passed
npm run verify:routes   Route verification passed (6 manifest routes: 2 public + 4 Next special routes)
npm run verify:runtime  Runtime dependency audit passed
npx tsc --noEmit        passed when run after build completion
npm run build           exit 0; Next static generation completed
npm run test:e2e         17 passed, 1 skipped; desktop 9/9, mobile 8/8 plus desktop-only search skip
npm run test:e2e -- tests/e2e/network-audit.spec.ts
                         desktop/mobile 2/2 passed; no non-local request or non-HMR 4xx/5xx response
```

2026-07-12 样式迁移新增验证：

```text
npx tsc --noEmit          passed
npm run test:unit         3 test files, 18 tests passed
npm run verify:routes     Route verification passed (6 routes)
npm run verify:runtime    Runtime dependency audit passed
npm run build             exit 0; Next static generation completed
isolated dev E2E          19 passed, 1 skipped (desktop/mobile; includes Portal variable assertion)
```

Build 的已知提示：仓库没有安装 `eslint`，Next 输出 `ESLint must be installed in order to run during builds`；这不是 build exit failure。另有 Browserslist 数据过旧提示。

阶段性浏览器证据：

- portfolio route E2E：入口项目卡片可见，可进入 `/mint-forest`。
- session/read E2E：desktop 和 mobile session/read 流程在 Task 6 阶段通过；mobile 的 desktop-only Forest search 按设计 skip。
- action E2E：desktop/mobile 通过本地 GreenID、daily、box、spin 流程。
- task E2E：desktop 2/2 通过 Bridge 和 Discord local verification。
- Task 10 ownership 迁移、GreenID 资源路径修复和 query 返回状态修复后，完整 desktop/mobile E2E 已重新通过。

## 本地资源证据

Task 3 下载的七个资源均已存在，`file` 报告为有效图片/GIF：

```text
3e13ad948b789a2be8837c38494089fbb03be67b15805b271ce10b80815954a4  public/projects/mint-forest/images/map/map.jpg
2c1a8fb2b82dad8068b4fbef0fdcdf403065a2a7a905498072958ef5b6af18b4  public/projects/mint-forest/images/ic-bubble-light.png
2a9a6655f5ab8f147921302f95eca16bc462ef7206251dea954d5640c448fb15  public/projects/mint-forest/images/pic-spin-bg-mobile.png
e47d11f7aed76091c90cf4fa5c7f59168d1b1d19de7aa12c95b9ec16d7798e58  public/projects/mint-forest/images/pic-spin-bg.png
aba7742d06112a054c853f2a4bdf05ab6ea9de48172ed9c0f85ebd752a85d72c  public/projects/mint-forest/images/ic-box.png
a94254d55a5cc1de799f200f0bfe88385e96683dd6faf3cea68dedafdfb145af  public/projects/mint-forest/images/nft/greenid-demo.png
5834d219f957eb51aa5a6848aaa9b830372292d750cb6a1e760c2775326e1d14  public/projects/mint-forest/images/bubble-robot.gif
```

## 浏览器截图与像素证据

已在 `1440x900` 和 `390x844` 检查入口及登录后的 Mint Forest 页面：

- `output/playwright/portfolio-desktop.png`
- `output/playwright/mint-forest-desktop-late.png`
- `output/playwright/mint-forest-mobile.png`
- desktop canvas sample：`[55, 114, 94, 255]`
- mobile canvas sample：`[231, 99, 28, 255]`

截图确认 GreenID 宝箱、地图 canvas、desktop/mobile 菜单和 Demo ID 可见，无旧 `/forest/ic-box.png` broken image。

## 当前未完成停点

1. 第三方 credential rotation 没有执行，也不能由源码清理替代；需要用户在对应平台人工处理。
2. 当前截图和 E2E 覆盖了主要业务流程；少量重复失败态主要由 deterministic rules unit tests 覆盖，后续可继续补更细的 UI failure assertions。
3. 当前没有 push、merge、rebase、发布或部署。

## 下一步执行

后续若继续开发，可按以下顺序复核：

```bash
npm run test:e2e -- tests/e2e/network-audit.spec.ts
npm run test:e2e
npm run test:unit
npm run verify:routes
npm run verify:runtime
npx tsc --noEmit
npm run build
```

确认浏览器回归通过后，复核 `git diff --check`、`git status --short` 和 `git diff --name-status`，再创建剩余阶段性本地 commits。不要 push、merge、rebase、发布或部署。
