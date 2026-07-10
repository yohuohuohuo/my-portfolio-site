# HANDOFF.md

## 当前快照

日期：2026-07-10

项目根目录：

```text
/Users/qiuyupan/git_workspace/my-portfolio-site
```

本仓库是用户从 Mint Forest 项目拷贝来的前端代码。目标已经明确为个人作品集项目，但业务改造尚未开始，当前代码仍基本保持 Mint Forest V3 活动/游戏站形态。

当前 Git 状态：

- `main` 分支尚无本地 commit。
- `origin/main` 显示 gone。
- 源码、配置、资源和文档目前都是 untracked。
- 本轮只更新项目文档，没有修改业务源码，也没有 commit。

## 已确认目标

用户已经确认以下方向：

1. 增加个人作品集入口页面，用于连接当前及未来的子作品。
2. 根路由 `/` 作为作品集入口。
3. Mint Forest 作为子作品放在 `/mint-forest`。
4. Mint Forest 专属代码归类到 `src/projects/mint-forest`。
5. Mint Forest 专属资源归类到 `public/projects/mint-forest`。
6. 保留 Mint Forest 业务交互，但移除所有链上操作和链基础设施。
7. 原本需要链上写入或后端保存的状态改为 `localStorage`。
8. 外部接口改为项目内 gateway 和 fixtures，并保持原接口返回结构。
9. Mock 只需支持页面交互，不要求还原完整后端规则。
10. 作品集入口只做最小项目导航，不虚构个人资料。
11. Mock 实现最小确定性状态规则，而不是所有操作无条件成功。
12. 先生成 implementation plan 并暂停审核，确认后再自动执行。
13. 允许新增 Vitest、Playwright 和最小自动化测试。
14. 允许下载代码实际引用的 Mint Forest CDN 资源并本地化。
15. 允许创建脱敏 initial commit 和阶段性本地 commits，但禁止 push、merge、rebase、发布或部署。

正式设计规格：

`docs/superpowers/specs/2026-07-10-portfolio-mint-forest-migration-design.md`

## 已确认技术方案

- 继续使用 Next.js Pages Router，删除未使用的 App Router 模板。
- `src/pages/index.tsx` 作为作品集入口。
- `src/pages/mint-forest/index.tsx` 作为薄路由，只加载子项目根组件。
- 使用集中项目配置连接子作品，不在入口组件中硬编码项目清单。
- 使用浏览器内 gateway 替换外部 API，不新增 Next API Routes 或独立后端。
- 使用 fixtures 提供排行榜、新闻、活动、搜索结果等只读数据。
- 使用版本化 localStorage repository 保存交互状态。
- 默认 localStorage key：`portfolio:mint-forest:v1`。
- 钱包登录替换为本地演示会话。
- Discord/Twitter 任务验证替换为本地模拟结果。
- 所有 Mint Forest 远程静态资源迁入本地 `public` 目录。
- 提供用户可见的“重置演示数据”操作。
- 固定使用可重复的 seed 和奖励结果，保证测试稳定。

## 目标模式执行停点

正式规格已经适配 Codex 目标模式。首次运行必须：

1. 只读盘点页面、交互、API、Web3、OAuth、外部资源和状态字段。
2. 生成 `docs/superpowers/plans/2026-07-10-portfolio-mint-forest-migration.md`。
3. 在修改业务源码、安装依赖或创建 commit 前暂停。
4. 等待用户明确确认 implementation plan。

计划确认后，目标模式可以连续执行后续阶段，每阶段验证通过后创建本地 commit。只有真实阻塞或需要超出规格的新产品决策时才暂停。

## “保留交互”的边界

需要保留的业务体验：

- 地图拖动、缩放、建筑、区域和动画
- 演示登录和退出
- GreenID 展示与领取
- 能量领取、邀请奖励和 steal
- Lucky Spin
- 背包、NFT、宝箱和开启操作
- 任务、任务详情和任务结果
- 排行榜、邀请、活动和新闻
- Forest ID 搜索
- OAuth 任务验证的本地演示流程
- 原有弹窗、加载、成功、失败和状态反馈

需要移除的链基础设施：

- RainbowKit、wagmi、viem、WalletConnect
- 钱包连接、网络切换和消息签名
- 合约地址、ABI、合约读写和交易确认
- Mint Chain RPC、explorer、bridge 和 swap

## 当前技术栈

- Next.js `15.2.6`
- React `19`
- TypeScript `5.5.2`
- Tailwind CSS `3`
- SCSS
- zustand
- axios
- Two.js
- motion
- 当前仍安装 RainbowKit、wagmi、viem，待去链上化完成后删除

可用脚本：

```bash
npm run dev
npm run build
npm run start
```

仓库有 `yarn.lock`，此前验证使用的是 `npm run build`。当前没有 `lint` 或 `test` script。

后续计划已获授权新增最小测试基础设施：

- Vitest：gateway、localStorage repository 和状态规则。
- Playwright：入口、主要交互、刷新持久化、重置、桌面/移动端和网络请求审计。

## 当前应用结构

- `next.config.js`
  - `/` rewrite 到 `/home`
  - 配置了 SVG 导入
  - 允许 `static.mintchain.io/forest/**` 远程图片
- `src/pages/_app.tsx`
  - 注入 RainbowKit/Wagmi provider、全局 Layout、样式和 Alert
  - SEO/meta 仍是 Mint Forest 内容
- `src/pages/_document.tsx`
  - 加载 Google reCAPTCHA 和 Mint Forest Google Analytics
- `src/pages/home/index.tsx`
  - 当前业务入口
  - 组装地图、登录、操作区和移动端菜单
- `src/pages/home/components`
  - Mint Forest 页面组件，会被 Next 误生成为 route
- `src/pages/home/sections`
  - Mint Forest sections 和 modal views，会被 Next 误生成为 route
- `src/shared`
  - 混合了真正公共代码与 Mint Forest 专属 hooks、services、const 和工具
- `src/app/layout.tsx`
  - App Router 模板残留
- `public`
  - Mint Forest 图片、地图、字体、音乐等资源尚未按子项目归类

## 当前外部依赖和敏感残留

- `https://api.mintforest.io`
- `https://static.mintchain.io`
- Mint Chain RPC、explorer、bridge 和 swap
- Mint Forest 合约地址和 ABI
- WalletConnect project id
- Discord/Twitter OAuth
- Google reCAPTCHA
- Google Analytics
- Mint Forest SEO、OG、标题和文案

源码中已有疑似 OAuth secret。不要把具体值复制到文档、日志或提交说明。后续需要先从源码移除，再在对应第三方平台轮换。

## 已验证事实

此前运行过：

```bash
npm run build
```

结果：

- 退出码为 `0`。
- Next production build、编译和静态页生成完成。
- 构建提示缺少 ESLint 依赖，lint 阶段未执行。
- Browserslist/caniuse-lite 数据过旧。
- route table 出现 `/home/components/*` 和 `/home/sections/*`，确认内部组件被当成页面。

设计文档落地后尚未重新运行构建，因为本轮没有修改业务源码。

## 推荐执行顺序

### 阶段零：盘点和计划审核

1. 只读盘点全部用户交互、service 合同、Web3/OAuth 调用、外部资源和状态字段。
2. 将逐文件任务、交互映射、测试和 commit 边界写入 implementation plan。
3. 自检计划是否覆盖设计规格全部验收标准。
4. 暂停并等待用户确认，不修改业务源码。

### 第一阶段：安全基线

1. 移除 OAuth secret 和不应提交的配置。
2. 检查 `.env` 是否被 `.gitignore` 覆盖。
3. 检查源码中是否还有凭据字面量。
4. 重写仍为 RainbowKit 模板的 README，说明项目来源和改造目标。
5. 建立经过脱敏的原始代码 initial commit。

### 第二阶段：作品集入口和结构迁移

1. 新建 `src/pages/index.tsx`。
2. 新建集中项目配置和 Mint Forest 项目入口。
3. 将 `src/pages/home/components` 和 `sections` 迁出 `src/pages`。
4. 将 Mint Forest 专属 shared 代码迁入 `src/projects/mint-forest`。
5. 将资源迁入 `public/projects/mint-forest`。
6. 删除 `/` 到 `/home` 的 rewrite 和 App Router 模板残留。
7. 运行构建并确认只生成真实页面 route。

### 第三阶段：本地数据层

1. 盘点现有 service 方法和返回类型。
2. 建立 fixtures、gateway 和 localStorage repository。
3. 将查询接口切换到 fixtures/localStorage。
4. 将写入接口切换到本地状态变更。
5. 验证刷新持久化、损坏数据恢复和初始 seed。

### 第四阶段：去链上化和外部清理

1. 用本地演示会话替换钱包登录。
2. 替换 claim、steal、spin、开箱等合约调用。
3. 替换 OAuth 验证。
4. 删除 Web3 providers、hooks、services、ABI 和无引用依赖。
5. 本地化远程 Mint Forest 资源。
6. 删除原 GA、reCAPTCHA、Mint Forest meta 和远程域名配置。

### 第五阶段：发布验证和文档

1. 验证 `/` 和 `/mint-forest` 桌面端、移动端流程。
2. 验证 Network 面板没有 Mint Forest API、CDN、RPC 或 OAuth 请求。
3. 运行 `npm run build`。
4. 重写 README 和部署说明。
5. 更新本文件中的完成状态、验证结果和剩余风险。

## 下一步停点

设计和目标模式执行协议已经确认并写入本地文档，但详细到文件、接口、状态规则和测试步骤的 implementation plan 尚未生成，业务源码也尚未修改。

下一位 agent 应先阅读 `AGENTS.md` 和正式设计规格，只读盘点后生成 implementation plan，然后暂停等待用户审核。计划确认后允许创建本地阶段性 commits，但不得 push、merge、rebase、发布或部署。

## 本轮文档变更

- 更新 `AGENTS.md`
- 更新 `HANDOFF.md`
- 更新 `docs/superpowers/specs/2026-07-10-portfolio-mint-forest-migration-design.md`，加入目标模式执行合同
- 未修改业务源码
- 未运行构建
- 未创建 commit
