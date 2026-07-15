# 高级前端面试指南 V2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在保留现有面试指南、DOCX 和生成脚本的前提下，新增一套 Markdown-only 的高级前端面试指南 V2。

**Architecture:** V2 使用 6 份职责单一的 Markdown 文档：入口说明统一事实标签和版本边界；作战手册限定 24 个 P0；STAR 故事库隔离真实事实与待补事件；技术题库承载扩展复习；一页速查用于面试当天；JD 路径负责按岗位和时间切换。现有文档继续作为完整历史题库，不参与改写。

**Tech Stack:** Markdown、ripgrep、Git

## Global Constraints

- 不修改 `docs/interview/高级前端开发工程师面试指导.md`。
- 不修改 `docs/interview/高级前端开发工程师面试指导.docx`。
- 不修改 `docs/interview/generate_interview_guide.py`。
- 不创建任何 DOCX、PDF 或生成器。
- 不改应用代码、依赖、配置或测试。
- 不读取或写入任何敏感信息。
- 只允许本地 commit；禁止 push、merge、rebase、发布和部署。
- 手工编辑全部使用 `apply_patch`。

---

## Task 1: 建立 V2 入口与事实合同

**Files:**

- Create: `docs/interview/v2/README.md`

- [x] 说明 V2 与原指南的关系：原指南保留为完整题库，V2 用于面试前执行。
- [x] 定义 `[候选人确认]`、`[简历事实]`、`[源码可证]`、`[通用原理]`、`[设计提案]`、`[待补 STAR]` 六类标签。
- [x] 说明 Mint Forest 历史线上项目与当前本地作品集版本的证据边界。
- [x] 写明仓库 Next.js 15.2.6 与 2026-07-15 学习基线的区别。
- [x] 给出 6 份文档的阅读顺序和使用场景。

## Task 2: 生成 24 个 P0 作战问题

**Files:**

- Create: `docs/interview/v2/01-面试作战手册.md`

- [x] 创建个人定位与协作 5 题。
- [x] 创建核心项目与职责 6 题。
- [x] 创建 React、Next.js、性能与工程 6 题。
- [x] 创建 Web3、数据精度与系统设计 7 题。
- [x] 每题提供问题、30 秒短答、90 秒展开、证据边界和高概率追问。
- [x] 对未确认的事故、结果和职责使用条件句或 `[待补 STAR]`，不写成既成事实。

## Task 3: 建立项目事实表与 STAR 故事库

**Files:**

- Create: `docs/interview/v2/02-真实项目与-STAR-故事库.md`

- [x] 分别记录 1DEX、Mint Blockchain / Mint Forest、NFTScan 的可用事实和不可外推内容。
- [x] 建立 8 个行为题故事槽位：紧期限交付、技术分歧、线上故障、估期变化、远程阻塞、协助同事、发布回滚、数据精度风险。
- [x] 每个槽位包含 Situation、Task、Action、Result、证据、禁说项和 30/90 秒表达结构。
- [x] 未有真实来源的字段统一标为 `[待本人补充]`。

## Task 4: 建立扩展技术题库

**Files:**

- Create: `docs/interview/v2/03-高级前端技术题库.md`

- [x] 按 React、Next.js、性能、JavaScript / TypeScript、工程化、Web3 / 系统设计分组。
- [x] 标记 P0、P1、P2，并为每题提供答题检查点，不复制长篇标准答案。
- [x] 明确 React Effect 绘制时序例外、Next.js 15/16 术语差异、EIP-5792 当前字段和 EIP-7702 的边界。
- [x] 加入 React、Next.js、web.dev、Ethereum EIP、Solana 官方参考链接。
- [x] 明确“会回答原理”不等于“项目实际采用”。

## Task 5: 生成当天速查与 JD 路径

**Files:**

- Create: `docs/interview/v2/04-面试当天一页速查.md`
- Create: `docs/interview/v2/05-JD-定向复习路径.md`

- [x] 速查页提供可直接使用的 60 秒自我介绍、三项目短答、职责边界、关键数字、高风险技术一句话、禁说项和反问。
- [x] JD 路径区分通用高级前端与 Web3 前端。
- [x] 两条路径分别提供 10、30、60 分钟复习计划。
- [x] 建立 JD 关键词到文档与问题编号的映射，并为经验缺口提供诚实答法。

## Task 6: 更新项目交接信息

**Files:**

- Modify: `HANDOFF.md`

- [x] 记录 V2 文档集、设计规格、执行计划和旧文档保留状态。
- [x] 明确本次无应用代码、runtime、依赖和构建配置变更。

## Task 7: 静态验收与 Git scope 审核

**Files:**

- Verify: `docs/interview/v2/*.md`
- Verify: `docs/interview/generate_interview_guide.py`
- Verify: `docs/interview/高级前端开发工程师面试指导.docx`
- Verify: `docs/interview/高级前端开发工程师面试指导.md`

- [x] 运行 `find docs/interview/v2 -maxdepth 1 -type f -name '*.md' | wc -l`，期望为 `6`。
- [x] 运行 `rg -c '^### P0-' docs/interview/v2/01-面试作战手册.md`，期望为 `24`。
- [x] 运行 `rg -n '\[已确认\]|TODO|TBD|待定' docs/interview/v2`，期望无结果。
- [x] 运行 `find docs/interview/v2 -type f ! -name '*.md'`，期望无结果。
- [x] 运行 `git diff 24c983d -- docs/interview/generate_interview_guide.py docs/interview/高级前端开发工程师面试指导.docx docs/interview/高级前端开发工程师面试指导.md`，期望无结果。
- [x] 运行 `git diff --check`，期望通过。
- [x] 运行 `git status --short` 和 `git diff --name-status`，确认 scope 只有计划内文档。
- [x] 做一个仅本地提交；不执行 push、merge、rebase、发布或部署。
