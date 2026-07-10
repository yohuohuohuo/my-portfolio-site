# AGENTS.md

## 项目定位

本仓库是从 Mint Forest 前端源码整理出的个人作品集项目。Mint Forest 现在是作品集中的本地交互演示，不再作为线上 Web3 产品开发。

当前路由：

- `/`：最小作品集入口。
- `/mint-forest`：Mint Forest 子作品。

当前分支为 `codex/portfolio-migration`。允许阶段性本地 commit；禁止 push、merge、rebase、发布和部署。

## 目录 ownership

```text
src/
├── pages/
│   ├── _app.tsx
│   ├── _document.tsx
│   ├── index.tsx
│   └── mint-forest/index.tsx
├── portfolio/
├── projects/mint-forest/
└── styles/globals.scss

public/projects/mint-forest/
```

- `src/pages` 只放真实页面和 Next 特殊文件；`src/pages/mint-forest/index.tsx` 是薄路由。
- `src/portfolio` 负责入口配置、项目卡片和入口样式。
- Mint Forest 的 components、sections、hooks、services、store、types、fixtures、utils、SVG 和样式全部归属 `src/projects/mint-forest`。
- Mint Forest 静态资源全部归属 `public/projects/mint-forest`。
- `src/shared` 已删除。不得重新引入只服务 Mint Forest 的 shared 模块。
- `_app.tsx` 只允许导入全局样式和字体，不得导入 Mint runtime、provider、store、component 或 service。

## Runtime 边界

Mint Forest 不得产生以下运行时行为：

- 钱包连接、签名、切链、合约读写、交易确认或区块浏览器跳转。
- Mint Forest API/CDN、Mint Chain RPC、explorer、bridge、swap、NFTScan 请求。
- Discord/Twitter OAuth、Google Analytics 和 reCAPTCHA。
- 直接 Axios、直接 `localStorage` 或散落的 session/token 缓存。

页面使用 `src/projects/mint-forest/data/mint-forest.gateway.ts` 保留原 endpoint 结构，fixtures 和纯规则提供确定性 mock。持久化统一通过 `data/local-storage.repository.ts`，键为 `portfolio:mint-forest:v1`，schema version 为 `1`。

所有 mutation 都必须能体现成功、重复、参数错误或资源不足等状态，不能把 mock 写成无条件成功。用户可通过 `Reset Demo Data` 恢复默认 seed。

## 交互范围

继续维护地图拖动/缩放、区域和建筑、Demo 登录/退出、GreenID、daily/invite/steal、Lucky Spin、背包/NFT/宝箱、任务、排行榜、邀请、新闻、活动、Forest ID 搜索、桌面/移动菜单及原有加载/弹窗/成功/失败反馈。链基础设施不属于必须保留的交互。

## 修改规则

- 默认用中文沟通；技术名词、API、路径和包名保持原文。
- 修改前先读 `HANDOFF.md`、正式设计规格和 implementation plan。
- 不读取、输出或提交 `.env`、token、OAuth secret、WalletConnect credential 或其他敏感值。源码删除不等于第三方 credential 已轮换；轮换只能记录为人工外部任务。
- 优先复用现有 gateway、repository、fixtures、Zustand store 和 project-owned hooks，不新增后端或第二套持久化真相。
- 手工代码编辑使用 `apply_patch`；批量路径迁移和格式化可使用对应的机械化命令。
- 不做与作品集入口、Mint Forest 隔离、本地 mock、去链上化和验证无关的重构。

## 验证命令

```bash
npm run test:unit
npm run verify:routes
npm run verify:runtime
npx tsc --noEmit
npm run build
npm run test:e2e
```

`test:e2e` 使用 Playwright 的 `desktop`（1440x900）和 `mobile`（390x844）项目，并需要启动本地 `127.0.0.1:3100` dev server。网络边界测试必须在导航前记录 HTTP(S) 请求，只允许 `127.0.0.1` 或 `localhost`。

`verify:runtime` 是发布前的静态边界检查，覆盖禁止域名、Web3/OAuth/Analytics/reCAPTCHA 标识、直接 Axios、直接存储、`@/shared`、残留 `src/shared` 和 `_app` 的 Mint runtime import。

## 文档与提交边界

- 设计规格：`docs/superpowers/specs/2026-07-10-portfolio-mint-forest-migration-design.md`
- 执行计划：`docs/superpowers/plans/2026-07-10-portfolio-mint-forest-migration.md`
- 当前快照：`HANDOFF.md`

在声称完成前必须提供命令结果、当前 Git scope、已知 warning 和无法执行的验证。不要把构建通过等同于浏览器验收通过，也不要声称已 push、merge、发布、部署或完成 credential rotation。
