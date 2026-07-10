# 个人作品集与 Mint Forest 子项目改造规格

状态：已确认，已适配 Codex 目标模式，尚未实施  
日期：2026-07-10

## 0. Codex 目标模式执行合同

### 0.1 可验证目标

将当前 Mint Forest 前端改造成个人作品集项目：根路由提供最小项目入口，Mint Forest 作为 `/mint-forest` 子作品保留全部业务交互；所有链上、钱包、OAuth、Mint Forest API 和 Mint Forest CDN 运行时依赖均替换为本地 fixtures、gateway 和版本化 `localStorage` 状态。

工作只有在本文件第 12 节全部验收标准均有测试或浏览器证据支持时才算完成。不能仅以“代码已修改”或“构建通过”作为完成依据。

### 0.2 Source of truth

目标模式开始后必须依次读取：

1. `AGENTS.md`
2. `HANDOFF.md`
3. 本文件

发生冲突时，权限和安全约束以 `AGENTS.md` 为准，当前实现状态以 `HANDOFF.md` 为准，产品目标、业务边界和验收标准以本文件为准。不得把目标状态误认为已经实现。

### 0.3 计划审核门

修改业务源码前，目标模式必须先完成只读盘点：

- 全部页面和内部误生成 route。
- 全部用户可见交互及其成功、失败和加载状态。
- 全部外部 API 方法、请求路径、参数、response envelope 和 TypeScript 类型。
- 全部 Web3 provider、hook、合约调用、ABI、链配置和钱包流程。
- 全部 OAuth、Analytics、reCAPTCHA 和外部脚本。
- 全部 Mint Forest CDN 资源引用及仓库内已有资源。
- 当前 store、缓存和持久化状态字段。

盘点结果必须写入详细 implementation plan：

`docs/superpowers/plans/2026-07-10-portfolio-mint-forest-migration.md`

implementation plan 必须按文件、接口、测试和 commit 拆分任务，并包含现有交互到本地实现的逐项映射。计划写完后必须暂停，等待用户审核。未收到用户明确的“计划已确认，继续执行”前，不得修改业务源码、安装依赖或创建 initial commit。

### 0.4 审核后的自动执行

计划通过审核后，目标模式获得以下授权：

- 按第 11 节连续执行，不需要每个阶段再次等待用户确认。
- 安装计划中明确列出的必要开发依赖。
- 下载源码实际引用的 Mint Forest CDN 静态资源。
- 创建脱敏 initial commit 和后续阶段性本地 commit。
- 启动本地开发服务器并使用真实浏览器验证。

每个阶段必须先完成该阶段验证，再创建本地 commit，然后继续下一阶段。只有遇到无法自行解决的阻塞、需要新增超出本规格的产品决策、权限被拒绝或现有要求互相冲突时才暂停询问。

### 0.5 禁止操作

目标模式不得：

- push、merge、rebase、发布或部署。
- 创建或修改远端仓库、PR、Issue 或线上配置。
- 输出、提交或复制 `.env`、OAuth secret、token 或其他凭据。
- 声称已完成第三方 OAuth credential 轮换；轮换属于人工外部操作。
- 为作品集入口虚构姓名、经历、联系方式、客户、项目成果或其他个人资料。
- 为了让测试通过而删除、隐藏或静默跳过原有业务交互。
- 在本地 mock 失败时回退到 Mint Forest API、CDN、RPC、合约或 OAuth。

### 0.6 停止条件

以下情况允许暂停并请求用户输入：

- implementation plan 等待首次审核。
- 需要访问规格未授权的新域名或外部系统。
- 无法从当前代码推导原接口合同或关键交互语义。
- 下载的必要资源不可用且仓库中没有可接受替代品。
- 测试揭示现有交互之间存在无法同时满足的冲突。

普通编译错误、测试失败、导入路径迁移、类型错误和可从源码推导的问题不构成暂停理由，应继续诊断和修复。

## 1. 项目背景

本项目代码来源于 Mint Forest。后续目标不是继续开发 Mint Forest 线上产品，而是整理成个人作品集项目。

Mint Forest 将作为作品集中的一个独立子作品保留，展示原项目的视觉、地图和业务交互，但不再依赖 Mint Chain、钱包、合约、Mint Forest 后端或第三方 OAuth 服务。

## 2. 总体目标

改造后项目包含两个层级：

1. 个人作品集入口页。
2. 独立的 Mint Forest 交互子作品。

目标路由：

- `/`：个人作品集入口。
- `/mint-forest`：Mint Forest 交互演示。
- 删除原 `/home` 业务入口和 `/` 到 `/home` 的 rewrite。
- 不再生成 `/home/components/*`、`/home/sections/*` 等内部路由。

入口页通过统一项目配置连接当前及未来的子作品，不在页面组件中硬编码项目列表。

## 3. 已选方案

采用兼容层迁移：尽量保留现有 Mint Forest 组件、视觉资产和业务交互，将组件对 API、Web3 和 OAuth 的依赖收口到本地 gateway，再使用 fixtures 和 `localStorage` 提供兼容数据。

没有选择完整重写，因为完整重写会扩大视觉和交互回归范围；也不保留旧 Web3 运行时，因为它与作品集演示目标冲突并增加外部依赖和发布风险。

## 4. 核心原则

### 4.1 子项目隔离

Mint Forest 专属代码统一归类到：

`src/projects/mint-forest/`

Mint Forest 专属静态资源统一归类到：

`public/projects/mint-forest/`

仅被 Mint Forest 使用的 components、sections、hooks、services、styles、types、SVG 和业务工具都应迁入该目录。只有入口页和多个子作品都会使用的代码，才允许保留在 `src/shared`。

### 4.2 保留业务交互

“保留所有交互”指保留用户可体验的业务流程，包括：

- 地图拖动、缩放、建筑和区域交互。
- 本地演示登录和退出。
- GreenID 展示与领取。
- MF 能量领取。
- 邀请奖励领取。
- 访问其他森林和 steal。
- Lucky Spin。
- 背包、NFT、宝箱及开启操作。
- 任务列表、任务详情和任务结果。
- 排行榜、邀请页面、活动和新闻。
- Forest ID 搜索。
- Discord/Twitter 任务验证的演示流程。
- 弹窗、加载、成功、失败和状态反馈。

钱包连接、切换网络、消息签名、交易确认、交易上链和区块浏览器跳转属于链基础设施，不作为需要保留的业务交互。这些流程应替换为本地演示会话和本地状态操作。

## 5. 目标目录

```text
src/
├── pages/
│   ├── _app.tsx
│   ├── _document.tsx
│   ├── index.tsx
│   └── mint-forest/
│       └── index.tsx
├── portfolio/
│   ├── components/
│   ├── config/
│   │   └── projects.ts
│   └── styles/
├── projects/
│   └── mint-forest/
│       ├── components/
│       ├── sections/
│       ├── hooks/
│       ├── services/
│       ├── data/
│       │   ├── fixtures/
│       │   ├── mint-forest.gateway.ts
│       │   └── local-storage.repository.ts
│       ├── store/
│       ├── types/
│       ├── utils/
│       ├── styles/
│       └── index.tsx
└── shared/
    ├── components/
    ├── hooks/
    ├── types/
    └── utils/

public/
└── projects/
    └── mint-forest/
```

`src/pages/mint-forest/index.tsx` 只负责声明页面和加载 Mint Forest 根组件，不承载业务实现。

继续使用 Pages Router。删除未使用的 `src/app` 模板残留。

## 6. 作品集入口页

入口页是项目导航页，不是 Mint Forest 页面换皮。

第一阶段只实现最小项目入口：

- 使用中性站点标题和简短说明。
- 展示 Mint Forest 项目卡片并链接到 `/mint-forest`。
- 不展示虚构的个人简介、履历、联系方式或其他作品。
- 不复用 Mint Forest 品牌作为整个作品集的视觉身份。
- 页面结构应允许未来通过项目配置增加更多子作品。

项目列表由 `src/portfolio/config/projects.ts` 提供，每个项目至少包含：

- `id`
- `name`
- `description`
- `cover`
- `href`
- `status`
- `tags`
- 是否为内部子项目

首个项目为 Mint Forest，链接到 `/mint-forest`。

新增子作品时，应优先添加项目配置和独立目录，不修改入口页核心结构，也不修改 Mint Forest 内部代码。

## 7. 去链上化

必须删除 Mint Forest 运行时对以下能力的依赖：

- RainbowKit
- wagmi
- viem
- WalletConnect
- Mint Chain RPC
- 智能合约地址和 ABI
- `writeContract`
- `sendTransaction`
- `waitForTransactionReceipt`
- 钱包签名登录
- 网络切换
- 链上交易状态查询

原本依赖链上写入的功能改为：

1. 校验本地演示状态。
2. 更新 `localStorage`。
3. 更新前端 store。
4. 返回与原调用结构兼容的异步结果。
5. 展示原有成功或失败反馈。

全部引用清理完成后，从 `package.json` 移除不再使用的 Web3 依赖。

## 8. localStorage 数据设计

统一使用一个带版本号的存储入口：

`portfolio:mint-forest:v1`

建议保存以下状态：

- 演示会话。
- 当前用户资料。
- GreenID 状态。
- 能量余额及领取记录。
- 已访问森林和 steal 记录。
- 背包和宝箱状态。
- Lucky Spin 次数及结果。
- 任务完成状态。
- 邀请奖励状态。
- 用户交互历史。

所有读写必须通过 `local-storage.repository.ts`，业务组件不得直接散落调用 `window.localStorage`。

要求：

- SSR 阶段不得访问 `window`。
- 首次访问时加载默认 seed。
- 数据损坏或版本不兼容时恢复默认 seed。
- 页面刷新后交互状态保持。
- 清除浏览器数据后恢复初始演示状态。
- 提供用户可见的“重置演示数据”操作，重置后无需打开开发者工具即可重新体验。
- 不实现账户同步、服务端持久化或跨设备同步。

### 8.1 最小确定性状态规则

本地 mock 不能把所有操作都实现成无条件成功，至少实现以下规则：

- 登录：创建稳定的本地演示用户；退出后数据保留，再次登录恢复同一用户状态。
- GreenID：初始为未领取，领取一次后变为已领取；重复领取返回可见失败结果。
- 能量领取：初始可领取一次；领取后增加固定能量并标记已领取；重复操作失败。
- 邀请奖励：初始可领取一次；领取后增加固定奖励；重复操作失败。
- Forest 搜索：仅返回 fixtures 中存在的 Forest ID；不存在时显示原有空状态或错误状态。
- Steal：同一目标在一次 seed 周期内只能成功一次；成功后增加固定能量并记录目标；重复 steal 失败。
- Lucky Spin：每次 spin 消耗一次可用次数，按固定 seed 奖励序列返回结果并更新背包；次数为零时失败。
- 开箱：消耗一个对应宝箱并按固定 seed 结果增加奖励；没有宝箱时失败。
- 任务：本地验证后进入可领取或已完成状态，奖励只能领取一次；重复验证或领取返回稳定结果。
- 重置：恢复默认 seed、演示用户、次数、背包、任务和所有一次性操作状态。

固定数值和奖励内容应在 implementation plan 的 fixture 设计中明确，不得依赖随机网络数据或当前链状态。自动化测试必须能够从默认 seed 得到可重复结果。

## 9. 本地接口 Mock

外部 API 不改成另一套远程服务，而是在项目内实现本地 gateway。

实现规则：

- 以现有 service 方法和 TypeScript 返回类型为合同。
- 保留原接口 response envelope 和字段结构。
- 只实现支持页面交互所需的最小逻辑。
- 查询类接口从 fixtures 或 localStorage 读取。
- 写入类接口更新 localStorage 后返回兼容结果。
- 所有方法继续返回 `Promise`。
- 不要求复现 Mint Forest 后端的完整业务规则。
- 不允许静默回退到 `api.mintforest.io`。

建议映射：

| 原能力 | 本地实现 |
| --- | --- |
| 用户信息 | fixture + localStorage |
| 登录 | 创建本地演示会话 |
| 排行榜、新闻、活动 | fixtures |
| Forest ID 搜索 | 本地用户 fixtures |
| claim、steal、spin | localStorage 状态变更 |
| 背包、宝箱 | fixtures + localStorage |
| 任务验证 | 本地确定性 mock |
| Discord/Twitter OAuth | 本地模拟验证，不跳转外部 OAuth |

## 10. 外部依赖清理

发布前必须移除或替换：

- `api.mintforest.io`
- `static.mintchain.io`
- Mint Chain RPC、explorer、bridge、swap
- Mint Forest 合约和 ABI
- WalletConnect 配置
- Discord/Twitter OAuth
- Google reCAPTCHA
- 原 Mint Forest Google Analytics
- Mint Forest SEO、OG、标题和文案
- 前端源码中的 OAuth secret

远程 Mint Forest 图片应迁入项目静态资源目录，页面运行时不得依赖 Mint Forest CDN。

资源本地化规则：

- 只下载源码、样式或 fixtures 实际引用的资源，不抓取无关目录。
- 允许的下载来源仅限代码中已经存在的 Mint Forest/Mint Chain 静态资源地址。
- 下载结果统一保存到 `public/projects/mint-forest`，并按用途组织子目录。
- 更新代码引用后，使用浏览器确认资源返回成功且画面不存在明显缺失。
- 下载失败时必须记录资源 URL、引用位置和影响，不能静默保留远程地址。
- 最终 Network 审计中不得再出现 Mint Forest 或 Mint Chain 静态资源请求。

已经出现在源码中的 OAuth secret 需要从代码中移除，并在对应平台轮换。当前本地仓库尚无 commit；如果该值曾进入其他仓库或远端 Git 历史，还需要在那里单独清理。仅删除本地源码不能使已经暴露的 secret 失效。

## 11. 实施阶段

### 阶段零：盘点和计划审核

- 完成第 0.3 节的只读盘点。
- 写入详细 implementation plan 和交互映射。
- 自检计划是否覆盖本文件全部验收标准。
- 暂停并等待用户确认计划。

### 阶段一：安全基线

- 清除 OAuth secret 和不应提交的环境配置。
- 检查 `.gitignore`。
- 清理 README 模板误导。
- 建立经过脱敏的 initial commit。
- 记录第三方 credential 仍需人工轮换，不得声称轮换已完成。

### 阶段二：路由和目录整理

- 新建 `/` 作品集入口。
- 新建 `/mint-forest`。
- 将 Mint Forest 代码迁入 `src/projects/mint-forest`。
- 将专属资源迁入 `public/projects/mint-forest`。
- 删除 `/home` rewrite 和内部组件路由。
- 删除 App Router 模板残留。
- 运行阶段测试和构建，创建结构迁移 commit。

### 阶段三：本地数据层

- 定义原 API 返回类型。
- 建立 fixtures。
- 建立 gateway。
- 建立版本化 localStorage repository。
- 将组件对 axios/API 的调用切换到 gateway。
- 实现第 8.1 节状态规则和重置能力。
- 增加 gateway/localStorage 单元测试并创建数据层 commit。

### 阶段四：去链上化

- 替换钱包登录。
- 替换合约读写。
- 替换切链和签名流程。
- 移除 Web3 providers、hooks、services、ABI 和依赖。
- 运行相关单元测试和 E2E，创建去链上化 commit。

### 阶段五：外部服务清理

- 下载并替换代码实际使用的远程静态资源。
- 移除 OAuth、GA 和 reCAPTCHA。
- 替换 SEO、OG、站点标题和图标。
- 确认运行时不存在 Mint Forest 生产依赖。
- 完成 Network 审计并创建外部依赖清理 commit。

### 阶段六：验证和文档

- 更新 README。
- 更新 AGENTS.md 和 HANDOFF.md。
- 补充本地数据重置和子项目新增说明。
- 完成第 15 节全部测试、构建和浏览器验证。
- 创建最终文档和验证 commit。

## 12. 验收标准

完成改造必须同时满足：

1. `/` 显示最小作品集入口，不包含虚构个人资料，并能进入 `/mint-forest`。
2. `/mint-forest` 保留阶段零盘点清单中的全部用户可见业务交互；任何删减都必须由用户明确批准。
3. 页面刷新后本地业务状态仍然存在。
4. 用户可以通过可见操作重置演示数据，清除 localStorage 后也能恢复默认状态。
5. 不连接钱包、不签名、不切链、不提交交易。
6. Network 面板中不存在 Mint Forest API、CDN、RPC 或 OAuth 请求。
7. 源码中不存在有效 OAuth secret。
8. 构建输出不再包含内部 components/sections route。
9. `npm run test:unit`、`npm run test:e2e` 和 `npm run build` 全部成功。
10. 桌面端和移动端均可完成主要交互。
11. Mint Forest 子项目代码不再散落于通用 `src/shared`。
12. 新增第二个子作品不需要修改 Mint Forest 代码。
13. GreenID、能量、邀请奖励、steal、spin、开箱和任务符合第 8.1 节的成功、重复操作和资源不足规则。
14. Playwright 证明刷新后状态持久化、重置后恢复默认 seed。
15. 实际使用的远程 Mint Forest 资源已下载到本地，缺失资源不存在静默外链回退。
16. Git 历史包含脱敏 initial commit 和阶段性本地 commits，但没有发生 push、merge 或发布。
17. README、AGENTS.md 和 HANDOFF.md 反映最终结构、验证证据、剩余限制和人工 credential 轮换事项。

## 13. 非目标

本阶段不包含：

- 还原完整 Mint Forest 后端业务。
- 模拟真实区块确认和 gas。
- 多用户服务端数据同步。
- 真实排行榜计算。
- 真实 OAuth。
- 真实钱包身份。
- CMS 或管理后台。
- 为未来子作品提前建设复杂插件系统。

## 14. 文档与实施边界

本文件同时定义目标模式的持久目标、权限边界和完成标准，但不替代详细 implementation plan。

首次目标运行只负责盘点并写出 implementation plan，然后必须暂停等待审核。用户确认计划后，同一目标可以自动执行剩余阶段，直到全部验收标准通过或遇到第 0.6 节规定的真实阻塞。

## 15. 自动化测试与浏览器验收

### 15.1 测试基础设施

允许新增最小测试依赖：

- Vitest：gateway、repository 和确定性状态规则的单元测试。
- Playwright：真实浏览器 E2E、响应式验证和网络请求审计。

实现后 `package.json` 必须提供：

```bash
npm run test:unit
npm run test:e2e
npm run build
```

### 15.2 单元测试最低覆盖

- 默认 seed 初始化。
- schema version 和损坏 JSON 恢复。
- SSR 或无 `window` 环境不会直接访问 localStorage。
- 登录、退出和恢复会话。
- GreenID、能量和邀请奖励不可重复领取。
- 同一 Forest 不可重复 steal。
- spin 次数和固定奖励序列。
- 开箱消耗和背包奖励。
- 任务验证、领取和重复操作。
- 重置后恢复默认状态。
- gateway 返回结构与现有 service 合同兼容。

### 15.3 Playwright 最低覆盖

- 桌面端 `1440x900` 和移动端 `390x844` 打开 `/`，进入 `/mint-forest`。
- 本地登录和退出。
- 地图主要区域、菜单和 modal 可访问，页面无明显遮挡或文本溢出。
- GreenID、能量、邀请奖励、Forest 搜索、steal、Lucky Spin、开箱和任务流程。
- 重复操作和资源不足时显示失败状态。
- 刷新页面后用户、余额、背包和任务状态保留。
- 使用页面上的重置操作后恢复默认 seed。
- 监控全部浏览器请求，断言不存在 Mint Forest API、CDN、RPC、OAuth、Analytics、reCAPTCHA 或钱包请求。
- 构建 route table 中不存在 components、sections、views 等内部模块 route。

自动化测试不能替代最终浏览器检查。目标模式还必须检查 `1440x900` 和 `390x844` 截图，确认地图、弹窗、入口卡片和交互控件没有空白、资源缺失、文本溢出或重叠。

## 16. 最终交付报告

目标完成时必须更新 `HANDOFF.md` 并给出：

- 各阶段实际完成内容。
- 本地 commit hash 和说明。
- 单元测试、E2E 和 build 的命令及结果。
- 浏览器验证的视口和流程。
- 外部请求审计结果。
- 已移除的 Web3、OAuth、API、CDN 和依赖清单。
- 与原 Mint Forest 交互相比仍存在的限制。
- 需要用户人工完成的 OAuth credential 轮换。
- 明确说明未 push、未 merge、未部署。
