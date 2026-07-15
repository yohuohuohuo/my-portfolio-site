# 个人作品集

本项目是从 Mint Forest 前端源码整理出的个人作品集基础。当前入口保持最小化，展示本地子作品和外链项目；Mint Forest 作为本地化交互演示运行，不需要钱包、区块链节点或后端服务。

## 路由

- `/`：作品集入口，展示项目配置。本地项目进入站内路由，外链项目打开项目官网。
- `/mint-forest`：Mint Forest 子作品。

## 本地运行

```bash
npm install
npm run dev
```

常用验证命令：

```bash
npm run test:unit
npm run test:e2e
npm run verify:routes
npm run verify:runtime
npm run build
```

项目使用 `yarn.lock` 维护依赖锁定；当前脚本通过 `npm run` 调用。Build 目前会提示仓库未安装 `eslint`，但 Next production build、类型检查和静态页生成可以完成。

## Mint Forest 本地运行模型

- 页面代码位于 `src/projects/mint-forest`。
- 页面资源位于 `public/projects/mint-forest`。
- endpoint 结构由 `data/mint-forest.gateway.ts` 在进程内 mock，返回原页面消费的 `{ code, msg, data }` 结构。
- fixtures、确定性 mutation rules 和版本化 `localStorage` repository 位于 `src/projects/mint-forest/data`。
- 持久化键为 `portfolio:mint-forest:v1`，页面菜单中的 `Reset Demo Data` 会恢复默认 seed。
- 登录使用本地 Demo session；GreenID、领取、steal、spin、开箱和任务验证都只修改本地演示状态。
- 页面运行时不请求 Mint Forest API/CDN、Mint Chain RPC、合约、钱包、OAuth、Analytics 或 reCAPTCHA。

新增外链项目时，只在 `src/portfolio/config/projects.ts` 增加项目配置，并把必要封面素材放到 `public/projects/portfolio`。新增本地子作品时，再在 `src/pages` 增加对应薄路由；不要把另一个项目的代码放进 Mint Forest 目录。

## 文档

- [AGENTS.md](AGENTS.md)：项目边界、目录 ownership 和后续 agent 规则。
- [HANDOFF.md](HANDOFF.md)：当前执行快照、验证证据、剩余停点和提交边界。
- [设计规格](docs/superpowers/specs/2026-07-10-portfolio-mint-forest-migration-design.md)
- [Implementation Plan](docs/superpowers/plans/2026-07-10-portfolio-mint-forest-migration.md)

项目不包含 credential、OAuth secret 或其他敏感配置值。第三方 credential 轮换仍是独立的人工外部任务，不能由删除源码替代。
