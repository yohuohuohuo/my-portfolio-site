# AGENTS.md

## 项目定位

本仓库来源于 Mint Forest 前端代码，目标是改造成个人作品集项目。Mint Forest 不再作为线上 Web3 产品继续开发，而是作为作品集中的一个独立交互子作品保留。

已确认的产品结构：

- `/`：个人作品集入口，用于展示和连接当前及未来的子作品。
- `/mint-forest`：Mint Forest 交互演示。
- 继续使用 Next.js Pages Router。
- Mint Forest 专属代码统一迁入 `src/projects/mint-forest`。
- Mint Forest 专属静态资源统一迁入 `public/projects/mint-forest`。

详细目标、边界和验收标准见：

`docs/superpowers/specs/2026-07-10-portfolio-mint-forest-migration-design.md`

## 当前状态

当前代码尚未完成上述改造，仍基本保持 Mint Forest V3 活动/游戏站形态：

- 当前业务入口是 `src/pages/home/index.tsx`。
- `/` 仍通过 `next.config.js` rewrite 到 `/home`。
- Mint Forest components 和 sections 位于 `src/pages/home` 下，会被 Next 当成公开 route。
- API、Web3、OAuth、Google Analytics、reCAPTCHA 和远程 Mint Forest 资源尚未清理。

开始任何实现前必须先读 `HANDOFF.md`，不要把目标状态误认为已经完成。

## 工作原则

- 默认用中文回复；技术名词、API、协议、包名和路径保留原文。
- 用户如果说“先分析”“不要改代码”“总结”“来源是什么”，只做只读排查。
- 修改范围应围绕作品集入口、Mint Forest 子项目隔离、去链上化、本地 mock 和发布清理，不做无关重构。
- 不要读取、输出或提交 `.env`、密钥、token、OAuth secret 或 WalletConnect secret。
- 源码中已经出现过疑似 OAuth secret。删除源码值不等于完成轮换；轮换凭据属于独立外部操作。
- 发布前必须确认运行时不再访问 Mint Forest API、CDN、RPC、合约、OAuth 或原统计服务。

## 目标模式执行授权

本项目已获用户确认，可按正式设计规格使用 Codex 目标模式执行，但必须遵守以下停点：

1. 修改业务源码前先完成只读盘点。
2. 将详细 implementation plan 写入 `docs/superpowers/plans/2026-07-10-portfolio-mint-forest-migration.md`。
3. 计划写完后暂停，等待用户明确确认。
4. 用户确认计划后，才可自动执行剩余阶段。

计划确认后允许：

- 安装计划中明确列出的 Vitest、Playwright 等必要开发依赖。
- 下载代码实际引用的 Mint Forest CDN 资源并本地化。
- 创建脱敏 initial commit 和阶段性本地 commits。
- 启动本地服务器并执行浏览器验收。

始终禁止：

- push、merge、rebase、发布或部署。
- 输出、提交或复制敏感值。
- 虚构个人资料或声称已完成第三方 credential 轮换。
- 删除、隐藏或跳过无法立即实现的现有交互。

## 架构约束

### 路由和目录

- `src/pages` 只允许放真实页面、API route 及 Next 特殊文件。
- Mint Forest 的 components、sections、hooks、services、store、types、styles 和业务工具不得继续放在 `src/pages`。
- `src/pages/mint-forest/index.tsx` 应保持为薄路由，只加载子项目根组件。
- 仅被 Mint Forest 使用的代码不得留在通用 `src/shared`。
- 只有入口页和多个子作品共同使用的代码，才能保留在 `src/shared`。
- 删除未使用的 `src/app` App Router 模板，避免双路由体系并存。

目标目录：

```text
src/
├── pages/
│   ├── _app.tsx
│   ├── _document.tsx
│   ├── index.tsx
│   └── mint-forest/index.tsx
├── portfolio/
├── projects/mint-forest/
└── shared/

public/
└── projects/mint-forest/
```

### 作品集入口

- 子作品列表由集中配置提供，建议入口为 `src/portfolio/config/projects.ts`。
- 每个项目配置至少包含 `id`、`name`、`description`、`cover`、`href`、`status` 和 `tags`。
- 新增子作品时，不应修改 Mint Forest 内部代码。
- 当前不建设 CMS、插件系统或通用动态页面生成器。
- 第一阶段只做最小项目入口，不虚构姓名、履历、联系方式或其他作品。
- 入口页使用中性站点身份，不把 Mint Forest 品牌扩展为整个作品集品牌。

### Mint Forest 交互边界

“保留所有交互”指保留可体验的业务流程、动画、弹窗和状态反馈，包括地图、GreenID、能量、steal、Lucky Spin、背包、宝箱、任务、排行榜、邀请、新闻、活动和 Forest ID 搜索。

以下链基础设施不要求保留，并必须从运行时移除：

- 钱包连接
- 网络切换
- 钱包签名
- 合约读写
- 交易确认
- 区块浏览器跳转

这些流程统一替换为本地演示会话和本地异步操作。

### 本地数据和 Mock

- 原外部 API 调用改为项目内 gateway，不新增远程后端。
- gateway 必须保留现有 service 方法和 TypeScript 返回结构，避免 UI 感知数据来源变化。
- 查询类数据来自本地 fixtures 或 `localStorage`。
- 写入类操作更新 `localStorage` 后返回与原接口兼容的 `Promise` 结果。
- 不复现完整后端规则，只实现支撑现有交互所需的最小确定性逻辑。
- 不允许在 mock 失败时静默回退到 `api.mintforest.io`。
- 业务组件不得直接散落调用 `window.localStorage`；读写统一通过 repository。
- 默认存储键为 `portfolio:mint-forest:v1`，数据必须带 schema version。
- SSR 阶段不得访问 `window`；损坏或不兼容的数据应恢复默认 seed，不能导致页面崩溃。
- 登录、领取、steal、spin、开箱和任务必须实现设计规格第 8.1 节的最小确定性规则，不能全部无条件成功。
- 必须提供可见的“重置演示数据”操作。

### 外部依赖清理

最终运行时必须移除：

- RainbowKit、wagmi、viem 和 WalletConnect
- Mint Chain RPC、合约地址和 ABI
- Mint Forest API 与 CDN
- Discord/Twitter OAuth
- Google reCAPTCHA
- Mint Forest Google Analytics
- Mint Forest SEO、OG、标题和品牌文案

依赖包只能在全部引用清理后从 `package.json` 删除。

源码实际引用的远程 Mint Forest 资源允许下载到 `public/projects/mint-forest`。只下载实际引用资源，失败时记录清单，不得静默保留远程地址。

## 实施顺序

1. 盘点代码并生成 implementation plan，暂停等待审核。
2. 计划确认后清除敏感配置并检查 `.gitignore`。
3. 清理 README 模板误导，记录当前项目来源和改造目标。
4. 建立经过脱敏的原始代码基线 commit。
5. 建立作品集入口和目标路由。
6. 将 Mint Forest 代码和资源迁入独立目录。
7. 建立 fixtures、gateway 和版本化 localStorage repository。
8. 替换外部 API、OAuth 和 Web3 调用。
9. 删除无引用依赖、旧路由、模板和远程资源配置。
10. 更新 README、HANDOFF 和部署说明中的最终结构与验证结果。

每个实施阶段验证通过后创建本地 commit。不要 push、merge、rebase、发布或部署。

## 本地命令

```bash
npm run dev
npm run build
npm run start
```

当前尚无 `lint` 或 `test` script。实施计划必须新增 Vitest 和 Playwright，并提供：

```bash
npm run test:unit
npm run test:e2e
```

此前 `npm run build` 成功，但提示缺少 ESLint 依赖。

## 验证要求

结构迁移或功能调整后至少运行：

```bash
npm run build
```

测试基础设施建立后，相关阶段和最终验收还必须运行：

```bash
npm run test:unit
npm run test:e2e
```

浏览器验证必须覆盖：

- `/` 可以进入 `/mint-forest`。
- `/mint-forest` 在桌面端和移动端可用。
- 刷新后本地状态仍然存在。
- 清除 localStorage 后恢复默认状态。
- Network 面板不存在 Mint Forest API、CDN、RPC 或 OAuth 请求。
- 构建 route table 不包含 components、sections 等内部模块。
- 主要交互不触发钱包、签名、切链或链上交易。
- GreenID、能量、邀请、steal、spin、开箱和任务的成功与失败状态符合规格。
- 页面上的重置操作可以恢复默认 seed。
- Playwright 覆盖桌面端和移动端，并审计全部外部请求。
