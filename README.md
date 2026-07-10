# 个人作品集

本仓库由 Mint Forest 前端源码复制而来，当前处于迁移前的脱敏基线状态。现有 Mint Forest 页面和基础设施尚未完成迁移，不应视为已发布的产品或部署配置。

目标结构如下：

- `/`：个人作品集入口，用于展示和连接子作品。
- `/mint-forest`：保留为独立交互演示的 Mint Forest 子作品。

仓库不包含 credential、OAuth secret 或其他敏感配置值。第三方 credential 的轮换属于独立外部操作，不能由源码删除替代。

## 本地运行

```bash
npm run dev
npm run build
npm run start
```

## 迁移资料

- 设计规格：[`docs/superpowers/specs/2026-07-10-portfolio-mint-forest-migration-design.md`](docs/superpowers/specs/2026-07-10-portfolio-mint-forest-migration-design.md)
- 实施计划：[`docs/superpowers/plans/2026-07-10-portfolio-mint-forest-migration.md`](docs/superpowers/plans/2026-07-10-portfolio-mint-forest-migration.md)
