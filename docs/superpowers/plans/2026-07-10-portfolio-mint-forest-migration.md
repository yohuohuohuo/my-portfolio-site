# 个人作品集与 Mint Forest 迁移 Implementation Plan

> **状态（2026-07-12）：** 本计划记录的迁移任务已完成，以下 SCSS、Tailwind CSS 3 和 `tailwind.config.js` 内容仅保留为当时的历史执行记录，不得作为当前实施指令。当前样式约束以 `AGENTS.md`、`HANDOFF.md`、`src/styles/globals.css` 和 `postcss.config.mjs` 为准：使用 Tailwind CSS v4、标准 CSS 与 `@tailwindcss/postcss`，不允许新增 Sass 或 `.scss` 文件。

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把当前 Mint Forest Web3 前端改造成个人作品集项目：`/` 提供最小项目入口，`/mint-forest` 保留全部用户可见业务交互，并用本地 fixtures、compatibility gateway 和版本化 `localStorage` 取代 API、钱包、合约和 OAuth。

**Architecture:** 继续使用 Next.js Pages Router。页面目录只保留薄路由，Mint Forest 的代码、样式、SVG 和状态全部收口到 `src/projects/mint-forest`；现有 endpoint 字符串和 `{ code, msg, data }` envelope 由无网络的 compatibility gateway 接管。所有 mutation 通过可测试的确定性 rules 写入 `portfolio:mint-forest:v1`，Zustand 只承担响应式 UI 状态，不成为第二份持久化真相。

**Tech Stack（当前）：** Next.js 15.2.6、React 19、TypeScript 5.5.2、Tailwind CSS 4、标准 CSS、`@tailwindcss/postcss`、Zustand、Two.js、Vitest、jsdom、Playwright。

## Global Constraints

- Source of truth：`docs/superpowers/specs/2026-07-10-portfolio-mint-forest-migration-design.md`。
- 本计划必须先由用户审核；收到“计划已确认，继续执行”前，不得执行任何 task。
- 允许创建脱敏 initial commit 和阶段性本地 commits；禁止 push、merge、rebase、发布和部署。
- 不读取、输出或提交 `.env`、secret、token、OAuth credential 或 WalletConnect credential。
- credential 轮换是人工外部动作，只能记录为未完成，不能声称已轮换。
- 第一阶段作品集入口只显示中性标题、简短说明和 Mint Forest 项目卡片；不得虚构个人资料。
- 保留阶段零盘点中的全部用户可见交互；钱包连接、签名、切链、交易确认和浏览器链上跳转除外。
- 本地数据 key 固定为 `portfolio:mint-forest:v1`，schema version 固定为 `1`。
- Mock 必须确定性可重复；不能把全部 mutation 实现成无条件成功。
- 最终浏览器运行时不得请求 Mint Forest API/CDN、Mint Chain RPC、OAuth、Analytics、reCAPTCHA 或钱包服务。
- 只下载源码实际引用的 Mint Forest/Mint Chain 静态资源；下载失败不得静默保留远程地址。
- Repo 只有 `yarn.lock`。使用 Yarn v1 修改依赖和锁文件；测试及构建仍使用规格要求的 `npm run ...` scripts。
- 每个 task 先写或启用能失败的验证，再实现，再运行验证，再 commit。

---

## Current-State Evidence

- Git：`main` 无 commit，`origin/main` gone，`git ls-files` 为空，全部项目文件 untracked。
- 源码：`src` 下 144 个文件，约 11,028 行 TS/TSX/SCSS。
- 路由：`next.config.js` 将 `/` rewrite 到 `/home`；旧 `.next/server/pages-manifest.json` 含 `/home` 及约 40 个内部 components/sections route。
- 全局污染：`src/pages/_app.tsx` 全局注入 RainbowKit/Wagmi、Mint Forest meta、Mint Forest Layout 和业务样式。
- 外部脚本：`src/pages/_document.tsx` 注入 Google Analytics 和 reCAPTCHA。
- 数据：组件把 endpoint 字符串直接交给 `useAxios`，后者通过 Axios 请求 `https://api.mintforest.io` 并解构 `{ code, msg, data }`。
- 持久化：当前散落使用 token、news、audio 等多个 localStorage key；没有统一 schema 或损坏恢复。
- Web3：GreenID、daily/invite claim、steal、spin、open box 通过 `etherSvc` 写合约；登录使用钱包连接和签名。
- 测试：没有 unit/E2E 配置；`.eslintrc.json` 存在，但 package 缺 ESLint 依赖。
- 静态资源：本地 `public` 有 42 个 Mint Forest 资源；地图、spin 背景、bubble light、GreenID 图片仍从外部加载。

## Interaction Preservation Matrix

| 交互 | 当前入口 | 本地目标行为 | 必须验证的状态 |
| --- | --- | --- | --- |
| 地图初始化 | `sections/map-viewer.tsx` | 本地 map 图片渲染到 Two.js canvas | loading、canvas 非空、draw complete |
| 地图移动/缩放 | `map-viewer.tsx`、`drag-container.tsx` | 保留鼠标拖动、触摸拖动、wheel/pinch、惯性和边界回弹 | desktop/mobile 坐标或 scale 变化 |
| 区域/建筑 | `area.component.tsx`、`building.component.tsx` | 按 level 解锁，hover/tap 打开 building modal | locked、hover tip、modal open/close |
| 登录/退出 | `sections/login.tsx`、`box-top.tsx` | 本地稳定 demo session；邀请码输入保留；退出后数据保留 | loading、logged in、logged out、reload restore |
| Profile 菜单 | `box-top.tsx` | 显示 Demo ID，支持复制、重置和退出；不显示钱包语义 | copy toast、reset、logout |
| 背景音乐 | `background-music.tsx` | 播放/静音并保存到统一 state.preferences | toggle、reload persistence |
| GreenID | `green-id.component.tsx` | 保留展开/翻牌/claim 动画；claim 一次成功，重复失败 | inactive、claiming、active、duplicate error |
| 能量/等级 | `energy-box.component.tsx` | 基于本地 config 计算 level/progress，打开 activity modal | number animation、progress、modal |
| Daily claim | `bubble.component.tsx` | 固定 +120 MF，一次成功；重复失败 | spinner、飞入动画、余额、freeze/error |
| Invite claim | `bubble.component.tsx` | 固定 +80 MF，一次成功；重复失败 | spinner、余额、freeze/error |
| Forest 搜索 | `search-box.component.tsx` | 仅查询 fixture Forest ID | loading、result、no-data |
| Visit/steal | `rank-item.component.tsx`、`steal-header.tsx` | `/mint-forest?id=...` 进入其他森林；每个目标只 steal 一次 | other header、back、success、duplicate error |
| Lucky Spin | `lucky-spin/*` | 每次成本 100 MF、最多 5 次、固定奖励序列 | loading、rotation、reward modal、history、no attempts |
| Spin rules | `spin-rule.component.tsx` | 保留 mobile View More/View Less | collapsed/expanded |
| Backpack/NFT | `backpack-view.tsx` | 本地分页 fixtures；GreenID claim 后出现 NFT | loading、list、empty、pagination |
| Open box | `backpack-view.tsx` | 消耗 box、固定奖励入账、重复/无 box 失败 | loading、reward modal、box removal、balance |
| Tasks | `task-view.tsx`、`task-detail-view.tsx` | 保留 tabs、detail、输入验证、结果 modal；所有验证本地完成 | loading、in-progress/completed、invalid input、duplicate |
| Leaderboard | `leaderboard-view.tsx` | fixture pagination、我的排名、mobile search modal | loading、items、empty、search |
| Invite | `invite-view.tsx` | fixture records、复制 code、Web Share API/复制 fallback；不自动访问 Twitter | copy/share success、pagination |
| Activity | `activity-view.tsx` | mutation 自动追加本地 history，按日期分组 | loading、grouping、load more |
| News | `news-view.tsx` | fixture news、read/unread 写入统一 state | unread dot、read state、empty、local link |
| OAuth callback | `validator.tsx` | 删除 URL callback；Discord/Twitter task 在 task UI 内本地验证 | result modal、duplicate result |
| Desktop/mobile menus | `box-bottom.tsx`、`menu-mobile.tsx` | 保留桌面 modal 菜单和移动 tab 切换 | 每个 menu 可达、返回 Forest |

## API Compatibility Map

Gateway 的公开入口固定为：

```ts
export interface DemoApiResponse<T> {
  code: 200 | 401 | 500 | 5001 | 5002 | 5003 | 5004;
  msg: string;
  data: T;
}

export interface DemoRequest {
  url: string;
  method: 'get' | 'GET' | 'post' | 'POST';
  data?: unknown;
  params?: Record<string, unknown>;
  authType?: 'Required' | 'Optional' | 'Ignored';
}

export interface DemoGateway {
  request<T>(request: DemoRequest): Promise<DemoApiResponse<T>>;
  claimGreenId(): Promise<{ success: boolean; msg?: string }>;
  claimDaily(): Promise<{ success: boolean; msg?: string }>;
  claimInvite(): Promise<{ success: boolean; msg?: string }>;
  steal(greenId: string): Promise<{ success: boolean; msg?: string }>;
  spin(): Promise<DemoApiResponse<SpinResult>>;
  openBox(boxNumber: number): Promise<DemoApiResponse<OpenBoxResponse>>;
  reset(): MintForestDemoState;
}
```

| 原 endpoint | Method | 参数 | `data` 合同 / 本地方法 |
| --- | --- | --- | --- |
| `/api/forest/user/auth` | POST | `wallet_address`, `signature`, `message`, `invitation_code?` | string session token；本地忽略 wallet/signature，只保留邀请码输入 |
| `/api/forest/normal/getUserInfo` | GET | none | `IUserInfo` mine profile |
| `/api/forest/normal/getOtherUserInfo` | GET | `greenId` | `IUserInfo` other profile；不存在返回 `5001` |
| `/api/forest/white/getForestConfig` | GET | none | `{ content: ForestConfigItem[] }` |
| `/api/forest/normal/getForestNews` | GET | `cursor` | `{ content, next, result }`；`result` 与 `content` 指向相同 group list，兼容首页 unread 代码 |
| `/api/forest/normal/getUserActivity` | GET | `cursor`, `txType?` | `{ content: ActivityItem[], next: string }` |
| `/api/forest/task/list` | GET | `type` | `TaskItem[]` |
| `/api/forest/task/detail/:id` | GET | path id | `TaskItem` |
| `/api/forest/task/checkFollowX` | GET | none | `TaskVerifyResult` |
| `/api/forest/task/checkBridge` | GET | `txHash` | `TaskVerifyResult`；空值/不以 `0x` 开头返回 `5003` |
| `/api/forest/task/checkRedotPay` | GET | `uid` | `TaskVerifyResult`；空值返回 `5003` |
| `/api/forest/task/checkJoinDiscord` | GET | local demo code | `TaskVerifyResult`；不执行 OAuth |
| `/api/forest/normal/getUserInviteData` | GET | `cursor` | `{ content: InviteItem[], next: string }` |
| `/api/forest/normal/getRankData` | GET | `cursor` | `{ content: RankItem[], next: string }` |
| `/api/forest/normal/getBoxData` | GET | `status`, `cursor` | `{ content: BoxItem[], next: string }` |
| `/api/forest/normal/openBoxData` | GET | `boxNumber` | `OpenBoxResponse`，并由 gateway 同步完成本地 reward mutation |
| `/api/forest/normal/getMyNft` | GET | `cursor` | `{ content: NftItem[], next: string }` |
| `/api/forest/normal/openTurntable` | GET | optional legacy `name` | `SpinResult`，并由 gateway 同步完成成本/奖励 mutation |
| `/api/tree/get-forest-proof` | GET | legacy | 无调用方，删除而不 mock |

### DTO Compatibility Inventory

`src/projects/mint-forest/types/api.ts` must define these consumed shapes without `any`:

```ts
export interface IUserInfo {
  greenId: number;
  greenIdStatus: number;
  inviteCode: string;
  level: number;
  mfDailyAmounts: string;
  mfDailyStatus: number;
  mfInviteAmounts: string;
  mfInviteStatus: number;
  mfTotalAmounts: string;
  rankVO: { wallet: string; mfTotalAmounts: string; rankPlace: number; domain: string };
  stealTimes: number;
  time: number;
  turntableTimes: number;
  wallet: string;
  greenIdSpeedAmounts: string;
  domain?: string;
  canStolenAmounts: string;
  stolenStatus: number;
  signature: string;
  inviteSignature?: string;
  inviteNumber: number;
  inviteSpeedAmounts: string;
  infoType: 'mine' | 'other';
}

export interface ForestConfigItem {
  type: 'CONFIG_LEVEL' | 'CONFIG_TURNTABLE' | 'CONFIG_TURNTABLE_LIMIT_TIMES' | 'CONFIG_STEAL_LIMIT_TIMES' | 'CONFIG_TURNTABLE_SUBTRACT_MF';
  config: Array<{ amount: string; id: number; kind: number; name: string; unit: 'MF' | '' }>;
}

export interface TaskItem {
  id: number;
  taskName: string;
  taskTitle: string;
  description: string;
  logo: string;
  link: string;
  linkButton: string;
  mf: number;
  done: number;
  status: 0 | 1;
  startDate: number;
  endDate: number;
}

export interface RankItem { wallet: string; domain: string; mfTotalAmounts: string | number; rankPlace: number; greenId?: number }
export interface InviteItem { greenId: string; wallet: string; domain: string; inviteTime: string; mfTotalAmounts: number }
export interface ActivityItem { wallet: string; domain: string; txType: number; txHash: string; status: number; contract: string; tokenId: string; destination: string; amount: number; targetId: number; turntableUnit: string; name: string; createTime: string }
export interface BoxItem { wallet: string; boxNumber: number; boxId: number; name: string; speedAmount: string; status: number; createTime: string; openTime: string; signature: string }
export interface NftItem { nftUniqueNum: string; contract: string; tokenId: string; name: string; logo: string; speedAmount: string }
export type OpenBoxResponse = BoxItem;
export interface SpinResult { signature: string; turntableId: number; times: number; amount: string }
export interface TaskVerifyResult { taskId: number; status: 'completed'; reward: number }
export interface NewsAnnouncement { createTime: string; title: string; content: string; link: string }
export interface NewsGroup { time: string; announcements: NewsAnnouncement[] }
```

Legacy `wallet`, `contract`, `txHash` and `signature` properties remain only where the current UI response contract consumes them. Fixtures use `demo-*` values, local links and empty signatures; no rule may interpret them as real chain identity or authorization.

## Deterministic State Contract

创建 `src/projects/mint-forest/types/demo-state.ts`，固定以下结构：

```ts
export const MINT_FOREST_STORAGE_KEY = 'portfolio:mint-forest:v1';
export const MINT_FOREST_SCHEMA_VERSION = 1 as const;

export interface MintForestDemoState {
  schemaVersion: 1;
  session: {
    loggedIn: boolean;
    token: 'demo-session-v1' | '';
    userGreenId: '1001';
  };
  selectedForestId: string | null;
  users: Record<string, IUserInfo>;
  claims: {
    greenId: boolean;
    daily: boolean;
    invite: boolean;
    claimedTaskIds: number[];
  };
  visitedForestIds: string[];
  stolenForestIds: string[];
  config: {
    levelConfig: number[];
    totalStealLimit: number;
    maxSpin: number;
    turntableSpent: number;
    turntableRewards: number[];
  };
  spinRewardCursor: number;
  spinHistory: DemoSpinRecord[];
  boxes: DemoBox[];
  nfts: DemoNft[];
  tasks: DemoTask[];
  invites: DemoInvite[];
  activities: DemoActivity[];
  news: DemoNewsGroup[];
  readNewsTimes: string[];
  preferences: { audioMuted: boolean };
  nextEventSequence: number;
}
```

默认 fixture 数值固定为：

```ts
export const DEMO_VALUES = {
  userGreenId: '1001',
  userDomain: 'local.demo',
  inviteCode: 'FOREST-DEMO',
  baseEventTime: '2026-07-10T00:00:00.000Z',
  initialMf: 2400,
  dailyReward: 120,
  inviteReward: 80,
  stealReward: 60,
  totalStealLimit: 3,
  maxSpin: 5,
  spinCost: 100,
  spinRewards: [500, 50, 200, 1000, 100],
  boxRewards: { 501: 150, 502: 250 },
  taskRewards: { 2: 50, 3: 50, 4: 100, 6: 80 },
  levelConfig: [1000, 3000, 6000, 10000, 20000],
} as const;
```

Fixture users：mine `1001`，other `2001`、`2002`、`2003`、`2004`。四个 other fixtures 使默认 seed 能验证三次 steal 上限和第四次资源不足失败。每个 fixture 必须提供 `domain`，避免 UI 回退展示真实钱包语义；`wallet` 仅保留为旧 DTO compatibility 字段，值使用 `demo-user-<id>`。所有新增 activity/spin/task 记录以 `baseEventTime + nextEventSequence` 生成固定 ID 和时间，不读取当前时间，也不调用随机数。

---

### Task 1: Sanitize Source and Establish the Initial Baseline

**Files:**
- Modify: `.gitignore`
- Modify: `README.md`
- Modify: `src/shared/const/oauth.ts`
- Delete: `src/shared/services/twitter.service.ts`
- Verify without printing values: `.npmrc`, `.vscode/settings.json`
- Verify only: all current source/config/docs/public files

**Interfaces:**
- Consumes: current untracked Mint Forest copy.
- Produces: first restorable, credential-free Git baseline; no remote branch.

- [x] **Step 1: Remove the unused Twitter client-secret path without printing its value**

Delete `src/shared/services/twitter.service.ts`. In `src/shared/const/oauth.ts`, remove the `twitter-api-sdk` type import and all Twitter-only constants, including the client-secret export. Retain only constants still required by the temporary Discord flow until Task 8.

Verification command:

```bash
rg -n "TWITTER_CLIENT_SECRET|client_secret|twitter-api-sdk" src
```

Expected: no matches. Do not inspect `.env*`.

- [x] **Step 2: Harden ignored local artifacts**

Add these lines to `.gitignore`:

```gitignore
/playwright-report/
/test-results/
/coverage/
```

Retain existing ignores for `.env`, `node_modules`, `.next`, `_test`, and `.DS_Store`.

Verify `.npmrc` contains only the already inventoried `strict-peer-dependencies` key and `.vscode/settings.json` contains only editor/Prettier settings. Search suspicious key names with filename-only output so an unexpected value is never printed:

```bash
rg -il "auth|password|token|secret|credential" .npmrc .vscode
```

Expected: no matches. If a match appears, inspect only the key name and either remove the credential-bearing file from the baseline or ignore it; never print its value.

- [x] **Step 3: Replace the RainbowKit template README with the sanitized source-state README**

The README must state: source copied from Mint Forest; current state is pre-migration; target routes `/` and `/mint-forest`; no credential values; commands `npm run dev/build/start`; design spec and plan links; no deployment claim.

- [x] **Step 4: Verify the sanitized baseline still builds**

Run:

```bash
npm run build
```

Expected: exit `0`. Existing ESLint/Browserslist warnings may remain, but no compile/type failure.

- [x] **Step 5: Stage the complete sanitized baseline and inspect scope**

Run separately:

```bash
git add .
git status --short
git diff --cached --stat
```

Expected: project files are staged; `.env`, `.next`, `node_modules`, `_test`, `.DS_Store`, Playwright reports and test results are absent.

- [x] **Step 6: Commit the baseline**

```bash
git commit -m "chore: establish sanitized source baseline"
```

Expected: first local commit created; no push.

---

### Task 2: Add the Minimal Test and Verification Toolchain

**Files:**
- Modify: `package.json`
- Modify: `yarn.lock`
- Create: `vitest.config.ts`
- Create: `playwright.config.ts`
- Create: `scripts/verify-pages-routes.mjs`
- Create: `scripts/audit-runtime-dependencies.mjs`
- Create: `tests/unit/test-harness.test.ts`

**Interfaces:**
- Consumes: Yarn v1 lockfile and existing Next scripts.
- Produces: `npm run test:unit`, `npm run test:e2e`, `npm run verify:routes`, `npm run verify:runtime`.

- [x] **Step 1: Install only the approved test dependencies with Yarn**

```bash
yarn add --dev vitest jsdom @playwright/test
yarn playwright install chromium
```

Expected: `package.json` and `yarn.lock` update; no `package-lock.json` is created.

- [x] **Step 2: Add scripts**

Add exactly:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "test:unit": "vitest run",
    "test:e2e": "playwright test",
    "verify:routes": "node scripts/verify-pages-routes.mjs",
    "verify:runtime": "node scripts/audit-runtime-dependencies.mjs"
  }
}
```

- [x] **Step 3: Configure Vitest**

Create `vitest.config.ts`:

```ts
import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
  test: {
    environment: 'jsdom',
    include: ['tests/unit/**/*.test.ts'],
    restoreMocks: true,
  },
});
```

- [x] **Step 4: Configure Playwright for the required viewports**

Create `playwright.config.ts`:

```ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  use: { baseURL: 'http://127.0.0.1:3100', trace: 'retain-on-failure' },
  projects: [
    { name: 'desktop', use: { viewport: { width: 1440, height: 900 } } },
    { name: 'mobile', use: { viewport: { width: 390, height: 844 } } },
  ],
  webServer: {
    command: 'npm run dev -- --hostname 127.0.0.1 --port 3100',
    url: 'http://127.0.0.1:3100',
    reuseExistingServer: false,
  },
});
```

Port `3100` is reserved for the test server so Playwright cannot silently reuse an unrelated app on the normal development port.

- [x] **Step 5: Add route and runtime verifiers**

`scripts/verify-pages-routes.mjs` must read `.next/server/pages-manifest.json`, require `/` and `/mint-forest`, and fail on route names containing `/home`, `/components/`, `/sections/`, `/views/`, or `/lucky-spin/`.

`scripts/audit-runtime-dependencies.mjs` must scan only `src`, `next.config.js`, and `package.json`; fail on runtime strings/imports for `api.mintforest.io`, `static.mintchain.io`, Mint RPC URLs, RainbowKit, wagmi, viem, WalletConnect, Twitter SDK, reCAPTCHA, Google Analytics, contract ABI imports, `writeContract`, or `sendTransaction`. It must not scan docs or `.env*`.

- [x] **Step 6: Prove the unit harness works**

Create `tests/unit/test-harness.test.ts`:

```ts
import { describe, expect, it } from 'vitest';

describe('test harness', () => {
  it('runs TypeScript tests', () => {
    expect(1 + 1).toBe(2);
  });
});
```

Run:

```bash
npm run test:unit
npx playwright test --list --pass-with-no-tests
```

Expected: unit test passes; Playwright lists zero feature tests without configuration errors.

- [x] **Step 7: Commit the toolchain**

```bash
git add package.json yarn.lock vitest.config.ts playwright.config.ts scripts tests/unit/test-harness.test.ts .gitignore
git commit -m "test: add migration verification toolchain"
```

---

### Task 3: Create the Portfolio Route and Isolate Mint Forest from Pages

**Files:**
- Create: `src/pages/index.tsx`
- Create: `src/pages/mint-forest/index.tsx`
- Create: `src/portfolio/config/projects.ts`
- Create: `src/portfolio/components/portfolio-page.tsx`
- Create: `src/portfolio/components/project-card.tsx`
- Create: `src/portfolio/styles/portfolio.module.scss`
- Create: `src/styles/globals.scss`
- Move: `src/pages/home/index.tsx` -> `src/projects/mint-forest/index.tsx`
- Move: `src/pages/home/components/**` -> `src/projects/mint-forest/components/**`
- Move: `src/pages/home/sections/**` -> `src/projects/mint-forest/sections/**`
- Modify after move: `src/projects/mint-forest/components/rank-item.component.tsx`
- Modify after move: `src/projects/mint-forest/sections/steal-header.tsx`
- Modify after move: `src/projects/mint-forest/sections/views/invite-view.tsx`
- Move: `src/shared/styles/common.scss` -> `src/projects/mint-forest/styles/animations.scss`
- Move: `src/shared/styles/rc-dropdown.scss` -> `src/projects/mint-forest/styles/rc-dropdown.scss`
- Move/Refactor: `src/shared/styles/globals.scss` -> `src/projects/mint-forest/styles/theme.scss`
- Move: `public/images/**` -> `public/projects/mint-forest/images/**`
- Move: `public/music/**` -> `public/projects/mint-forest/music/**`
- Move: `public/fonts/**` -> `public/projects/mint-forest/fonts/**`
- Download: `public/projects/mint-forest/images/map/map.jpg`
- Download: `public/projects/mint-forest/images/ic-bubble-light.png`
- Download: `public/projects/mint-forest/images/pic-spin-bg-mobile.png`
- Download: `public/projects/mint-forest/images/pic-spin-bg.png`
- Download: `public/projects/mint-forest/images/ic-box.png`
- Download: `public/projects/mint-forest/images/bubble-robot.gif`
- Download: `public/projects/mint-forest/images/nft/greenid-demo.png`
- Create: `public/favicon.svg`
- Modify asset references: `src/projects/mint-forest/**/*.{ts,tsx,scss}`
- Modify: `src/pages/_app.tsx`
- Modify: `src/shared/components/common-img.component.tsx`
- Modify: `src/shared/components/dropdown.component.tsx`
- Modify: `src/shared/const/common.const.ts`
- Modify: `src/shared/const/scene.const.ts`
- Modify: `src/shared/utils/business/common.helper.ts`
- Modify: `src/shared/utils/string.util.ts`
- Modify: `next.config.js`
- Modify: `tailwind.config.js`
- Delete: `src/app/layout.tsx`
- Delete: `src/app/favicon.ico`
- Delete: `src/layout/footer.tsx`
- Delete: `src/layout/header.tsx`
- Delete: `src/layout/layout.tsx`
- Test: `tests/e2e/portfolio.spec.ts`

**Interfaces:**
- Produces: real pages `/` and `/mint-forest`; no internal component routes.
- Temporary compatibility: `/mint-forest` may still request the existing Web3 wrapper until Task 7; `/` must not require it.

- [x] **Step 1: Write the failing portfolio and route tests**

Create `tests/e2e/portfolio.spec.ts` with assertions that `/` contains a Mint Forest project card, contains no fabricated biography/contact labels, and navigates to `/mint-forest`; assert `/mint-forest` creates a visible canvas.

Run before implementation:

```bash
npm run test:e2e -- tests/e2e/portfolio.spec.ts
npm run build
npm run verify:routes
```

Expected: portfolio test and route verifier fail because `/` still rewrites to `/home` and `/mint-forest` does not exist.

- [x] **Step 2: Move local assets and download every currently referenced remote image**

Move existing assets first, preserving their current subpaths:

```bash
mkdir -p public/projects/mint-forest
git mv public/images public/projects/mint-forest/images
git mv public/music public/projects/mint-forest/music
git mv public/fonts public/projects/mint-forest/fonts
mkdir -p public/projects/mint-forest/images/map public/projects/mint-forest/images/nft
curl --fail --location --output public/projects/mint-forest/images/map/map.jpg https://static.mintchain.io/forest-v3/map.jpg
curl --fail --location --output public/projects/mint-forest/images/ic-bubble-light.png https://static.mintchain.io/forest/ic-bubble-light.png
curl --fail --location --output public/projects/mint-forest/images/pic-spin-bg-mobile.png https://static.mintchain.io/forest/pic-spin-bg-mobile.png
curl --fail --location --output public/projects/mint-forest/images/pic-spin-bg.png https://static.mintchain.io/forest/pic-spin-bg.png
curl --fail --location --output public/projects/mint-forest/images/ic-box.png https://static.mintchain.io/forest/ic-box.png
curl --fail --location --output public/projects/mint-forest/images/bubble-robot.gif https://static.mintchain.io/forest-v3/bubble-robot.gif
curl --fail --location --output public/projects/mint-forest/images/nft/greenid-demo.png https://www.mintchain.io/api/greenid/image/1001
file public/projects/mint-forest/images/map/map.jpg public/projects/mint-forest/images/*.png public/projects/mint-forest/images/bubble-robot.gif public/projects/mint-forest/images/nft/greenid-demo.png
```

Expected: every `curl` exits `0` and `file` identifies valid image data, including the BubbleRobot GIF discovered during the Task 3 source scan. If the GreenID endpoint returns a supported JPEG/WebP rather than PNG, rename it to the matching extension and use that exact local path. If a required download is unavailable and no equivalent local asset exists, stop under specification section 0.6; never retain a remote fallback.

Mechanically rewrite every project `/images/`, `/music/` and `/fonts/` reference to `/projects/mint-forest/images/`, `/projects/mint-forest/music/` and `/projects/mint-forest/fonts/`, including map, bubble, spin, box, GreenID, SCSS and `_app` font paths. `CommonImg` must treat every leading `/` path as same-origin. Delete `StaticBaseUrl`, `staticUrl`, `greenIdTokenUrl`, and `images.remotePatterns` after `rg` confirms no callers. This step intentionally precedes session/action E2E so later tasks never depend on the CDN.

- [x] **Step 3: Create the project registry**

`src/portfolio/config/projects.ts` must export:

```ts
export interface PortfolioProject {
  id: string;
  name: string;
  description: string;
  cover: string;
  href: string;
  status: 'available' | 'planned';
  tags: string[];
  internal: boolean;
}

export const projects: PortfolioProject[] = [{
  id: 'mint-forest',
  name: 'Mint Forest',
  description: 'An interactive forest experience preserved as a local, deterministic demo.',
  cover: '/projects/mint-forest/images/og-img.jpg',
  href: '/mint-forest',
  status: 'available',
  tags: ['Next.js', 'React', 'Two.js'],
  internal: true,
}];
```

- [x] **Step 4: Build the minimal neutral portfolio page**

Use semantic `<main>`, one compact heading, one sentence, and project cards from `projects`. Add `data-testid="project-mint-forest"`. Do not add fake profile data, contact links, marketing hero copy, nested cards, gradients, or Mint Forest branding outside the project card. Create a neutral local `public/favicon.svg`; it must not reuse the Mint Forest mark or invent a personal brand.

- [x] **Step 5: Move the Mint Forest page tree out of `src/pages`**

Use `git mv` for the three paths listed above. Preserve components/sections subpaths. Create `src/pages/mint-forest/index.tsx` as a thin page importing the project root; update all links from `/?id=<greenId>` and `/` back-navigation to `/mint-forest?id=<greenId>` and `/mint-forest`.

- [x] **Step 6: Separate global and project styles**

`src/styles/globals.scss` retains Tailwind directives and a neutral reset only. Move Mint color variables, `overflow:hidden`, project typography and animation classes into the Mint project styles and scope body-like behavior under `.mint-forest-root`. Because Pages Router only permits global stylesheet imports from `_app.tsx`, `_app.tsx` may import these project-owned SCSS files; every emitted Mint selector must be scoped, except `@font-face` and keyframes.

- [x] **Step 7: Make `_app.tsx` neutral while temporarily scoping Web3 to Mint Forest**

Replace Mint global metadata with a neutral portfolio title/description and the neutral favicon; remove site-wide Mint OG values instead of presenting the child-project cover as the portfolio identity. Add project-specific local OG metadata in `src/pages/mint-forest/index.tsx`. Render the portfolio without Mint Layout, then delete the now-unused `src/layout` tree. If Task 7 has not run yet, define a typed temporary page flag so only `/mint-forest` receives `RainbowRoot`; document this flag for deletion in Task 7.

- [x] **Step 8: Update Next and Tailwind config**

Remove the `/` rewrite, assert that Step 2 already removed `images.remotePatterns`, keep SVGR, and add `src/portfolio` plus `src/projects/mint-forest` to Tailwind content.

- [x] **Step 9: Run route, build, asset and browser verification**

```bash
npm run build
npm run verify:routes
npm run test:e2e -- tests/e2e/portfolio.spec.ts
rg -n "['\"]/(images|music|fonts)/|url\(/(images|music|fonts)/|static\.mintchain\.io|www\.mintchain\.io/api/greenid" src next.config.js
```

Expected: only real page routes, portfolio navigation passes, Mint canvas exists, and the asset scan has no matches.

- [x] **Step 10: Commit structural isolation and local assets**

```bash
git add src public next.config.js tailwind.config.js tests/e2e/portfolio.spec.ts
git commit -m "feat: add portfolio routes and isolate Mint Forest"
```

---

### Task 4: Implement Versioned State, Repository and Deterministic Rules

**Files:**
- Create: `src/projects/mint-forest/types/api.ts`
- Create: `src/projects/mint-forest/types/demo-state.ts`
- Create: `src/projects/mint-forest/data/fixtures/seed.fixture.ts`
- Create: `src/projects/mint-forest/data/fixtures/users.fixture.ts`
- Create: `src/projects/mint-forest/data/fixtures/content.fixture.ts`
- Create: `src/projects/mint-forest/data/local-storage.repository.ts`
- Create: `src/projects/mint-forest/data/demo-rules.ts`
- Test: `tests/unit/local-storage.repository.test.ts`
- Test: `tests/unit/mint-forest-rules.test.ts`
- Delete: `tests/unit/test-harness.test.ts`

**Interfaces:**
- Produces: `createSeedState()`, `createMintForestRepository(getStorage)`, pure rules for all mutations.
- Repository is the only module allowed to call Storage APIs.

- [x] **Step 1: Write failing repository tests**

Cover: missing key -> seed; valid state -> restore; invalid JSON -> seed; wrong version -> seed; `getStorage()` returns null -> in-memory seed without throwing; update persists; reset restores a deep-cloned seed.

- [x] **Step 2: Write failing rule tests**

Cover exact `DEMO_VALUES`: login creates the stable session; logout clears only session state; a later login restores the same business state; GreenID once; daily +120 once; invite +80 once; steal `2001/2002/2003` for +60 each, reject duplicate `2001`, and reject valid fourth target `2004` at the max-3 limit; spin cost 100 and reward sequence `[500, 50, 200, 1000, 100]`; insufficient MF fails without consuming an attempt; sixth spin fails; box 501 +150 and 502 +250 then disappear; opening an absent box fails; tasks `2/3/4/6` validate then credit `50/50/100/80` exactly once; repeated validation/claim is stable and does not credit again; reset restores all state.

- [x] **Step 3: Define the complete state and DTO types**

Copy the currently consumed `IUserInfo`, task, rank, box, NFT, activity, news and invite fields into project-owned types. Implement the exact `MintForestDemoState` above, including claim flags, visited/stolen IDs, spin history and deterministic event sequence. Do not use `any` in new repository/rules/gateway APIs.

- [x] **Step 4: Implement SSR-safe repository**

The factory must accept a storage getter, catch parse/write errors, validate `schemaVersion === 1`, and deep-clone seed objects. No module-level access to `window`.

- [x] **Step 5: Implement pure mutation rules**

Each rule receives state and returns `{ state, result }` without reading current time, network, wallet or random sources. Event IDs/timestamps derive only from `DEMO_VALUES.baseEventTime` and `nextEventSequence`. Every successful reward appends a deterministic activity item; failures leave state unchanged and return a stable user-facing message.

- [x] **Step 6: Run unit tests**

```bash
npm run test:unit
```

Expected: repository/rules tests pass with zero failures.

- [ ] **Step 7: Commit deterministic state core**

```bash
git add src/projects/mint-forest/types src/projects/mint-forest/data tests/unit
git commit -m "feat: add deterministic Mint Forest state core"
```

---

### Task 5: Implement the API-Compatible Local Gateway

**Files:**
- Create: `src/projects/mint-forest/data/mint-forest.gateway.ts`
- Create: `src/projects/mint-forest/hooks/use-demo-request.hook.tsx`
- Test: `tests/unit/mint-forest.gateway.test.ts`

**Interfaces:**
- Consumes: repository, rules, fixture DTOs.
- Produces: the `DemoGateway` and request hook from the API Compatibility Map.

- [x] **Step 1: Write failing compatibility tests for every endpoint row**

For each endpoint assert method/params, `code/msg/data`, required data fields, pagination cursor, no-data for unknown Forest ID, and persistent state after mutation. `/api/forest/user/auth`, `/api/forest/white/getForestConfig` and `/api/forest/normal/getForestNews` are callable before login; every other route returns `401` before local login.

- [x] **Step 2: Implement the endpoint router**

Use an explicit switch/table over exact legacy paths, plus a parser for `/api/forest/task/detail/:id`. Unknown routes return `5004`. Required routes return `401` when `session.loggedIn` is false; auth, global config and news are explicitly ignored-auth routes. Add a fixed short asynchronous delay of `80ms` so existing loading states remain observable and deterministic.

- [x] **Step 3: Implement `useDemoRequest` with existing hook semantics**

Return `{ run, cancel, loading, status }`. Unwrap `response.data` before `onSuccess`, map `200/401/500/5001/5002/5003/5004` to the project-owned `HttpCode`, invoke `onError` with `{ code, msg }`, and prevent callbacks after `cancel()` or unmount.

- [x] **Step 4: Run gateway tests**

```bash
npm run test:unit
```

Expected: all endpoint/envelope tests pass; no network mock library is used.

- [ ] **Step 5: Commit the gateway**

```bash
git add src/projects/mint-forest/data src/projects/mint-forest/hooks tests/unit/mint-forest.gateway.test.ts
git commit -m "feat: add local Mint Forest compatibility gateway"
```

---

### Task 6: Replace Wallet Login and Read-Only API Views

**Files:**
- Move/Refactor: `src/shared/hooks/use-global-store.hook.tsx` -> `src/projects/mint-forest/store/use-mint-forest-store.ts`
- Move/Refactor: `src/shared/hooks/use-user.hook.tsx` -> `src/projects/mint-forest/hooks/use-user.hook.tsx`
- Move/Refactor: `src/shared/hooks/use-global-config.hook.tsx` -> `src/projects/mint-forest/hooks/use-global-config.hook.tsx`
- Move/Refactor: `src/shared/hooks/use-search-user.tsx` -> `src/projects/mint-forest/hooks/use-search-user.tsx`
- Modify temporarily: `src/shared/hooks/index.tsx`
- Modify temporarily: `src/shared/hooks/use-alert.hook.tsx`
- Modify temporarily: `src/shared/hooks/use-scale-value.hook.tsx`
- Modify temporarily: `src/shared/components/alert.component.tsx`
- Modify: `src/projects/mint-forest/index.tsx`
- Modify: `src/projects/mint-forest/sections/login.tsx`
- Modify: `src/projects/mint-forest/sections/box-top.tsx`
- Modify: `src/projects/mint-forest/sections/lucky-spin/spin-box.component.tsx`
- Modify: `src/projects/mint-forest/sections/lucky-spin/spin-record.component.tsx`
- Modify: `src/projects/mint-forest/sections/views/activity-view.tsx`
- Modify: `src/projects/mint-forest/sections/views/backpack-view.tsx`
- Modify: `src/projects/mint-forest/sections/views/invite-view.tsx`
- Modify: `src/projects/mint-forest/sections/views/leaderboard-view.tsx`
- Modify: `src/projects/mint-forest/sections/views/news-view.tsx`
- Modify: `src/projects/mint-forest/sections/views/task-detail-view.tsx`
- Modify: `src/projects/mint-forest/sections/views/task-view.tsx`
- Modify: `src/projects/mint-forest/components/search-box.component.tsx`
- Test: `tests/e2e/mint-forest-session.spec.ts`
- Test: `tests/e2e/mint-forest-read-views.spec.ts`

**Interfaces:**
- Store hydrates from repository and exposes current/other user plus UI page status.
- Components call `useDemoRequest`, never Axios.

- [x] **Step 1: Write failing session and read-view E2E tests**

Session test: load map, enter invite code, click local login, see Demo ID, reload and remain logged in, logout and return to login, log in again and preserve data.

Read-view test: search `2001`; unknown ID no-data; visit other forest and return; open leaderboard, invite records, activity, news, backpack, task lists and spin history; exercise mobile menu tabs.

- [x] **Step 2: Move and implement the project-owned store/hydration hooks**

Use `git mv` for the four hooks listed above. Replace wallet-derived address/token with repository session and expose `hydrate()`, `syncFromRepository()`, `login(inviteCode?)`, `logout()` and `reset()` actions. Keep `pageStatus: loading | login | complete`. `selectedForestId` follows `/mint-forest?id=...`; clearing selection returns to the user's forest without leaving the route.

Until Task 10 updates the remaining mechanical imports, `src/shared/hooks/index.tsx` may re-export the project-owned store/user hooks, and the three direct store consumers in shared must import the project store explicitly. Mark these compatibility imports in the plan checklist; they are deleted in Task 10 and must not survive `verify:runtime`.

- [x] **Step 3: Rewrite Login without wallet UI**

Remove `useConnectModal`, `useSignMessage`, client address, signature generation and per-address token cache. Keep invite input, loading state, title and Explore transition. Button text becomes `Enter Demo`.

- [x] **Step 4: Rewrite profile controls**

Replace wallet icon/address with `Demo ID 1001`; actions are Copy Demo ID, Reset Demo Data, and Log Out. Reset must call gateway reset, rehydrate state, clear selected forest and show a success alert.

- [x] **Step 5: Switch every listed read call site to the gateway**

Replace `useAxios`/`httpService` at the project root, spin record, activity, backpack, invite, leaderboard, news, task list/detail, search and global config call sites listed in this task. Preserve endpoint configs and consumed DTO fields while changing the hook import. `sections/validator.tsx` is the only temporary Axios caller and is deleted in Task 8. Update news read tracking and audio preference to the unified state instead of standalone localStorage keys.

- [x] **Step 6: Replace external share navigation**

Invite Share uses `navigator.share` with a local `/mint-forest?inviteCode=FOREST-DEMO` URL; if unavailable, copy the local URL and show success. Do not call `twitter.com`.

- [x] **Step 7: Run read-flow verification**

```bash
npm run test:unit
npm run test:e2e -- tests/e2e/mint-forest-session.spec.ts tests/e2e/mint-forest-read-views.spec.ts
rg -n "useAxios|httpService" src/projects/mint-forest --glob '!**/sections/validator.tsx'
rg -n "localStorage" src/projects/mint-forest --glob '!**/data/local-storage.repository.ts'
```

Expected: session persistence and all read views pass in desktop/mobile projects; both source scans have no matches. The known validator remains the only temporary API client and is excluded explicitly because Task 8 deletes it.

- [ ] **Step 8: Commit session and read integration**

```bash
git add src/projects/mint-forest tests/e2e
git commit -m "refactor: use local session and read gateway"
```

---

### Task 7: Replace Every Chain Mutation and Remove Web3 Runtime

**Files:**
- Modify: `src/projects/mint-forest/components/green-id.component.tsx`
- Modify: `src/projects/mint-forest/components/bubble.component.tsx`
- Modify: `src/projects/mint-forest/sections/lucky-spin/spin-box.component.tsx`
- Modify: `src/projects/mint-forest/sections/views/backpack-view.tsx`
- Modify: `src/pages/_app.tsx`
- Modify: `src/shared/const/common.const.ts`
- Modify: `src/shared/const/index.ts`
- Modify: `src/shared/hooks/index.tsx`
- Delete: `src/shared/const/abi/green-id-abi.const.ts`
- Delete: `src/shared/const/abi/mint-forest-abi.const.ts`
- Delete: `src/shared/services/ethers.service.ts`
- Delete: `src/shared/hooks/use-check-wallet.hook.tsx`
- Delete: `src/shared/hooks/use-client-address.hook.tsx`
- Delete: `src/shared/hooks/use-forest-proof.hook.tsx`
- Delete: `src/shared/hooks/use-web3.hook.tsx`
- Modify: `package.json`
- Modify: `yarn.lock`
- Test: `tests/e2e/mint-forest-actions.spec.ts`

**Interfaces:**
- Consumes: deterministic gateway mutation methods.
- Produces: same UI animations and messages without chain IDs, wallets, signatures, hashes or receipts.

- [x] **Step 1: Write failing action E2E tests from a reset seed**

Cover GreenID success/duplicate; daily +120/duplicate; invite +80/duplicate; search 2001 and steal +60/duplicate; five deterministic spins and sixth failure; open box 501 +150 and removal; reload persistence after each class of mutation.

- [x] **Step 2: Replace GreenID chain flow**

Remove network checks, `GreenIdAddress`, NFTScan link and `etherSvc.claimGreenId`. Call `gateway.claimGreenId()`, rehydrate user, preserve card/preload/claim animation and show duplicate failure.

- [x] **Step 3: Replace daily, invite and steal flows**

Remove chain ID and switch network branches. Keep bubble loading, flying animation, frozen state, energy toast and steal-limit warning. Refresh from repository after mutation rather than manually calculating a second state copy.

- [x] **Step 4: Replace spin and box flows**

Spin calls `gateway.spin()` and uses returned amount/times; preserve the 4-second wheel and reward modal. Open box calls gateway once, removes the box, updates balance/history and preserves reward modal. No signature fields are consumed.

- [x] **Step 5: Remove the Web3 wrapper, constants and exact source files**

Remove the temporary page runtime flag, RainbowRoot and RainbowKit stylesheet from `_app`. Remove chain definitions, RPC/explorer/bridge/swap URLs, addresses and contract exports from `src/shared/const/common.const.ts`; keep only still-used non-chain constants until Task 10. Delete the ABI, ethers and four hook files listed above, and clean their barrel exports after `rg` confirms no callers.

- [x] **Step 6: Remove direct Web3 dependencies with Yarn**

```bash
yarn remove @rainbow-me/rainbowkit @tanstack/react-query wagmi viem
```

Expected: `package.json`/`yarn.lock` update; no package-lock. `yarn remove` completed manifest removal but its reinstall phase was blocked by the local proxy while fetching the existing optional `@napi-rs/canvas` binaries; the four direct lock entries were removed in the same Yarn v1 lockfile format, and no package-lock was created.

- [x] **Step 7: Run action verification and build**

```bash
npm run test:unit
npm run test:e2e -- tests/e2e/mint-forest-actions.spec.ts
npm run build
rg -n "@rainbow-me|wagmi|viem|WalletConnect|writeContract|sendTransaction|waitForTransactionReceipt|shouldMintChain|Mint(Main|Test)|GreenIdAddress|MintForestContract" src package.json
```

Expected: deterministic action tests pass; final scan has no matches for Web3 runtime imports, APIs, chain config or contract identifiers. DTO compatibility fields named `wallet` may remain but must contain only `demo-user-<id>` fixture values and cannot drive identity or UI actions.

- [ ] **Step 8: Commit chain removal**

```bash
git add src package.json yarn.lock tests/e2e/mint-forest-actions.spec.ts
git commit -m "refactor: replace wallet and chain flows"
```

---

### Task 8: Replace Task OAuth and Remove Third-Party Scripts

**Files:**
- Modify: `src/projects/mint-forest/sections/views/task-view.tsx`
- Modify: `src/projects/mint-forest/sections/views/task-detail-view.tsx`
- Modify: `src/projects/mint-forest/index.tsx`
- Modify: `src/pages/_document.tsx`
- Modify: `src/pages/_app.tsx`
- Delete: `src/projects/mint-forest/sections/validator.tsx`
- Delete: `src/shared/services/discord.service.ts`
- Delete: `src/shared/const/oauth.ts`
- Delete: `src/shared/context/http.context.tsx`
- Delete: `src/shared/context/index.ts`
- Delete: `src/shared/hooks/axios.hook.tsx`
- Delete: `src/shared/services/http.service.ts`
- Delete: `src/shared/services/index.ts`
- Delete: `src/shared/interfaces/http.interface.ts`
- Delete: `src/shared/utils/business/cache.helper.ts`
- Modify: `src/shared/hooks/index.tsx`
- Modify: `src/shared/interfaces/index.ts`
- Modify: `src/shared/utils/index.ts`
- Modify: `src/shared/const/common.const.ts`
- Modify: `package.json`
- Modify: `yarn.lock`
- Test: `tests/e2e/mint-forest-tasks.spec.ts`

**Interfaces:**
- Task `1` opens GreenID; task `2` local Follow X simulation; task `3` local Discord simulation; task `4` validates `0x` bridge input; task `6` validates non-empty Redot UID.

- [x] **Step 1: Write failing task tests**

Assert tabs, task detail/back, empty input error, valid input success modal, completed tab transition, and duplicate verification failure/stable completed state.

- [x] **Step 2: Replace task actions with local verification**

Remove `window.open` for task verification and remove `discordService.startOAuth`. Keep button loading/result modal. Route all verification through the gateway. Tasks `2/3/4/6` become completed after their valid local check and credit the fixed reward once; repeated checks return a stable visible result without another credit. Task `1` opens the local GreenID flow and has no separate task reward.

- [x] **Step 3: Remove callback validator and exact OAuth source**

Delete the validator render/file, `src/shared/services/discord.service.ts`, and `src/shared/const/oauth.ts` once no imports remain. With the final Axios caller gone, also delete the exact HTTP context/hook/service/interface and old cache helper listed above, remove `BaseApi`, and clean their barrels. `twitter.service.ts` was already deleted in Task 1; now remove both unused packages:

```bash
yarn remove twitter-api-sdk axios
```

- [x] **Step 4: Remove Analytics and reCAPTCHA**

Reduce `_document.tsx` to `Html`, `Head`, `body`, `Main`, and `NextScript`. Remove original Mint Forest GA/reCAPTCHA code and IDs. Confirm `_app` still contains only neutral portfolio metadata and the neutral favicon; Mint-specific local OG metadata remains confined to `/mint-forest`.

- [x] **Step 5: Run task and build verification**

```bash
npm run test:unit
npm run test:e2e -- tests/e2e/mint-forest-tasks.spec.ts
npm run build
rg -n "api\.mintforest\.io|axios|discord\.com|twitter\.com|x\.com|OAuth|oauth|recaptcha|googletagmanager|gtag\(|G-Q6SRB0V7X1|twitter-api-sdk" src package.json
```

Expected: tests/build pass and the source scan has no production API, Axios, external OAuth, social verification, Analytics or reCAPTCHA runtime references. Desktop task E2E passed; mobile task E2E was not rerun after the final deletion because local-port approval quota was exhausted in this session.

- [ ] **Step 6: Commit third-party removal**

```bash
git add src package.json yarn.lock tests/e2e/mint-forest-tasks.spec.ts
git commit -m "refactor: replace OAuth tasks with local verification"
```

---

### Task 9: Prove the Local Asset and Runtime Network Boundary

**Files:**
- Modify: `scripts/audit-runtime-dependencies.mjs`
- Test: `tests/e2e/network-audit.spec.ts`
- Fix only when the audits expose a missed reference: `src/**`, `public/projects/mint-forest/**`, `next.config.js`, `package.json`

**Interfaces:**
- Task 3 already made every visual/audio asset same-origin under `/projects/mint-forest`.
- This task supplies authoritative browser and static evidence that no remote production fallback remains.

- [x] **Step 1: Write the failing full-flow network audit**

Record every HTTP(S) browser request from before page navigation while executing portfolio navigation, login, GreenID, all menus, search/steal, tasks, five spins and box opening. Fail immediately when hostname is not `127.0.0.1` or `localhost`; include the unexpected URL in the assertion message. Run the test in both configured Playwright projects.

- [x] **Step 2: Strengthen the static runtime audit**

Make `verify:runtime` reject exact Mint Forest API/CDN, Mint RPC/explorer/bridge/swap, NFTScan, OAuth/social verification, Analytics, reCAPTCHA, RainbowKit/Wagmi/Viem/WalletConnect and contract execution imports/strings. Ignore SVG namespace declarations and documentation; scan only runtime source/config/manifest files. Also reject `staticUrl`, `greenIdTokenUrl`, `BaseApi`, direct Axios creation and direct `localStorage` calls outside `local-storage.repository.ts`.

- [x] **Step 3: Verify the localized asset inventory**

```bash
find public/projects/mint-forest -type f | sort
file public/projects/mint-forest/images/map/map.jpg public/projects/mint-forest/images/*.png public/projects/mint-forest/images/nft/*
shasum -a 256 public/projects/mint-forest/images/map/map.jpg public/projects/mint-forest/images/ic-bubble-light.png public/projects/mint-forest/images/pic-spin-bg-mobile.png public/projects/mint-forest/images/pic-spin-bg.png public/projects/mint-forest/images/ic-box.png public/projects/mint-forest/images/nft/*
```

Expected: all seven downloaded assets exist as valid image data. Preserve the hashes for HANDOFF evidence; do not compare them to invented expected hashes.

Evidence: seven assets exist and `file` reports valid JPEG/PNG/GIF data; SHA-256 values are recorded in HANDOFF. The browser network run is pending because the environment denied local port startup after the approval quota was exhausted.

- [x] **Step 4: Run build, static and browser network verification**

```bash
npm run build
npm run verify:runtime
npm run test:e2e -- tests/e2e/network-audit.spec.ts
```

Expected: all referenced local assets return `200`, canvas pixel sampling is nonblank, audio/image requests are same-origin, and no forbidden request is observed.

- [ ] **Step 5: Commit network-boundary evidence**

```bash
git add scripts/audit-runtime-dependencies.mjs tests/e2e/network-audit.spec.ts src public next.config.js package.json yarn.lock
git commit -m "test: enforce local Mint Forest runtime boundary"
```

---

### Task 10: Finish Project Ownership and Remove Dead Shared Runtime

**Files:**
- Move: `src/shared/components/**` -> `src/projects/mint-forest/components/common/**`
- Move: `src/shared/hooks/use-alert.hook.tsx` -> `src/projects/mint-forest/hooks/use-alert.hook.tsx`
- Move: `src/shared/hooks/use-click.hook.tsx` -> `src/projects/mint-forest/hooks/use-click.hook.tsx`
- Move: `src/shared/hooks/use-mobile.hook.tsx` -> `src/projects/mint-forest/hooks/use-mobile.hook.tsx`
- Move: `src/shared/hooks/use-preload-img.hook.tsx` -> `src/projects/mint-forest/hooks/use-preload-img.hook.tsx`
- Move: `src/shared/hooks/use-reach-bottom.hook.tsx` -> `src/projects/mint-forest/hooks/use-reach-bottom.hook.tsx`
- Move: `src/shared/hooks/use-resize.hook.tsx` -> `src/projects/mint-forest/hooks/use-resize.hook.tsx`
- Move: `src/shared/hooks/use-scale-value.hook.tsx` -> `src/projects/mint-forest/hooks/use-scale-value.hook.tsx`
- Move: `src/shared/hooks/use-scroll.hook.tsx` -> `src/projects/mint-forest/hooks/use-scroll.hook.tsx`
- Move: `src/shared/const/modal.const.ts` -> `src/projects/mint-forest/config/modal.config.ts`
- Move: `src/shared/const/scene.const.ts` -> `src/projects/mint-forest/config/scene.config.ts`
- Move: `src/shared/services/notify.service.ts` -> `src/projects/mint-forest/services/notify.service.ts`
- Move: `src/shared/svg/**` -> `src/projects/mint-forest/assets/svg/**`
- Move: retained `src/shared/utils/**` -> `src/projects/mint-forest/utils/**`
- Delete after import replacement: `src/shared/**`
- Retain outside project: neutral `src/styles/globals.scss`
- Delete: `src/projects/mint-forest/sections/river.tsx`
- Delete: `src/projects/mint-forest/sections/views/map-debug-view.tsx`
- Delete: `src/shared/const/validate.const.ts`
- Delete: `src/shared/const/http.const.ts`
- Delete: `src/shared/interfaces/common.interface.ts`
- Delete: `src/shared/interfaces/index.ts`
- Delete: `src/shared/services/performance-log.ts`
- Modify: `package.json`
- Modify: `yarn.lock`
- Test: `scripts/audit-runtime-dependencies.mjs`

**Interfaces:**
- No Mint Forest import path begins with `@/shared`.
- `src/pages/mint-forest/index.tsx` is the only page component boundary importing Mint runtime code. `_app.tsx` may import project-owned scoped global SCSS because Pages Router requires it, but must not import Mint providers, components, store or services.

- [x] **Step 1: Add a failing ownership/static audit**

Extend `verify:runtime` to fail on any `@/shared` import, any remaining `src/shared` file, or a Mint runtime/provider import from `_app.tsx`. Permit only the three scoped project SCSS imports from `_app.tsx`.

- [x] **Step 2: Move retained modules by the exact source-to-target map**

Use `git mv` for every retained path listed in this task. Move `HttpCode` and still-consumed API types into `src/projects/mint-forest/types/api.ts` instead of retaining the old HTTP context/interfaces. Use the Task 4 project types instead of moving the old `common.interface.ts`. Update every Mint import to the project-owned path, move the Alert render from `_app.tsx` into the Mint root, and delete the temporary shared hook re-exports introduced in Task 6.

- [x] **Step 3: Delete confirmed dead code and the shared tree**

Delete the exact dead files listed above, the unused `getLandPathFromSvg` export from the moved map helper, old interfaces/barrels, and then the empty `src/shared` directories. Confirm each deletion with `rg` before removal and assert `test ! -d src/shared` afterward.

- [x] **Step 4: Remove unused dependencies**

After `rg` proves zero imports, remove:

```bash
yarn remove @napi-rs/canvas big.js svg-path-properties
yarn remove @types/big.js
```

Retain `rxjs` only if the migrated notify service still uses it; otherwise remove it in the same step after replacing notifications with store actions.

- [x] **Step 5: Run full static/build/unit checks**

```bash
npm run verify:runtime
npm run test:unit
npm run build
npm run verify:routes
test ! -d src/shared
rg -n "@/shared" src
rg -n "@/projects/mint-forest/(components|hooks|services|store)" src/pages/_app.tsx
```

Expected: no forbidden imports/strings, no shared tree, no Mint runtime import in `_app`, no internal routes, and all tests/build pass. The only allowed `_app` project imports are scoped SCSS paths.

- [ ] **Step 6: Commit ownership cleanup**

```bash
git add src package.json yarn.lock scripts
git commit -m "refactor: finish Mint Forest project isolation"
```

---

### Task 11: Run Full Browser Acceptance and Update Durable Documentation

**Files:**
- Modify: `README.md`
- Modify: `AGENTS.md`
- Modify: `HANDOFF.md`
- Modify: E2E tests only if a test is shown to miss a required interaction
- Generated but ignored: `test-results/**`, `playwright-report/**`

**Interfaces:**
- Produces: final evidence for all 17 design-spec acceptance items.
- No runtime behavior should be invented in documentation.

- [x] **Step 1: Run the full automated gate from a clean local state**

```bash
npm run test:unit
npm run build
npm run verify:routes
npm run verify:runtime
npm run test:e2e
```

Expected: all commands exit `0`; record test counts and route table.

- [x] **Step 2: Perform desktop and mobile visual/browser checks**

At `1440x900` and `390x844`, capture `/` and the logged-in `/mint-forest` state. Verify: project card visibility; canvas nonblank pixel data; map framing; menu reachability; modal fit; no overlap/text overflow; local images/audio load; GreenID, bubbles, spin and box animations complete.

- [x] **Step 3: Audit every preserved interaction**

Walk the Interaction Preservation Matrix line by line. For each row record automated test name or browser evidence. Any row without evidence is incomplete and must be implemented/tested before proceeding.

- [x] **Step 4: Update README**

Document final routes, local-only data model, reset control, commands, project structure, adding another child project, no backend/Web3 requirement, and that credential rotation remains an external manual task.

- [x] **Step 5: Update AGENTS and HANDOFF**

Replace target-state language with actual paths/status. HANDOFF must list commits, exact command results, removed dependencies/domains, screenshots/viewports, residual limitations, credential rotation, and explicit `not pushed / not merged / not deployed` status.

- [x] **Step 6: Review final Git scope**

```bash
git status --short
git log --oneline --decorate --max-count=20
```

Expected: only intended final documentation changes remain unstaged; local commit history contains the baseline and phase commits; no remote action occurred.

- [x] **Step 7: Commit final docs and evidence summary**

```bash
git add README.md AGENTS.md HANDOFF.md
git commit -m "docs: record portfolio migration verification"
```

- [x] **Step 8: Start the final local development server**

Check whether port `3000` is free, then start `npm run dev -- --hostname 127.0.0.1 --port 3000` in a persistent session. If occupied, choose the next free port, re-open `/` and `/mint-forest` once, and record the actual local URL. Do not deploy or expose the server beyond localhost.

- [x] **Step 9: Produce the final report**

Report: changed architecture; commit hashes; all command results; browser viewports; network audit; removed Web3/OAuth/API/CDN dependencies; remaining interaction limitations; manual credential rotation; active local URL; no push/merge/deploy.

---

## Acceptance Coverage Audit

| Spec acceptance item | Implemented by | Authoritative evidence |
| --- | --- | --- |
| 1. Minimal `/` and link to `/mint-forest` | Task 3 | `portfolio.spec.ts`, screenshots |
| 2. All inventoried interactions retained | Tasks 3, 6-11 | Interaction Matrix audit + E2E/browser evidence |
| 3. Reload persistence | Tasks 4, 6, 7 | repository unit tests + session/action E2E |
| 4. Visible reset and seed recovery | Tasks 4, 6 | rules test + session E2E |
| 5. No wallet/sign/chain transaction | Task 7 | runtime audit + dependency manifest |
| 6. No forbidden browser requests | Tasks 8-9 | `network-audit.spec.ts` |
| 7. No effective OAuth secret | Tasks 1, 8 | source scan; external rotation explicitly pending |
| 8. No internal component routes | Tasks 3, 10 | build manifest + `verify:routes` |
| 9. Unit/E2E/build pass | Tasks 2-11 | final five-command gate |
| 10. Desktop/mobile flows | Tasks 3, 6-11 | Playwright projects + screenshots |
| 11. No Mint code scattered in shared | Task 10 | ownership audit + source tree |
| 12. Second project does not touch Mint code | Task 3/10 | centralized registry and thin route boundaries |
| 13. Deterministic success/failure rules | Tasks 4, 7, 8 | unit tests + action/task E2E |
| 14. Playwright persistence/reset proof | Tasks 6-7 | session/action E2E |
| 15. Runtime assets local | Tasks 3, 9 | downloaded file inventory + hashes + network audit |
| 16. Local phased commits, no publication | Tasks 1-11 | local `git log`, no push/merge/deploy action |
| 17. Durable docs reflect final state | Task 11 | README/AGENTS/HANDOFF review |

## Plan Review Gate

This plan is now the only permitted write from specification section 0.3. Do not execute Task 1 or any later task until the user explicitly confirms the implementation plan and instructs the goal to continue.
