# 高级前端开发工程师中文简历重构实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** 基于已确认的事实和代码证据，生成一份 ATS 友好、两页 A4、可继续按 JD 裁剪的中文高级前端开发工程师主简历。

**Architecture:** 以 Markdown 作为唯一内容真相，通过独立的 `python-docx` 脚本生成 DOCX。内容层与排版层分离；生成后执行文本断言、PDF 页数检查和逐页图片检查，不能只凭 DOCX 可打开就判定完成。

**Tech Stack:** Markdown、Python 3、python-docx 1.2.0、LibreOffice、Poppler、Codex DOCX render helper。

## Global Constraints

- 设计规格：`docs/superpowers/specs/2026-07-15-senior-frontend-resume-restructure-design.md`。
- 定位：通用 Senior Frontend，Web3 是差异化优势。
- 最终文档：中文、A4、严格两页、单栏、ATS 友好。
- 新文件写入 `docs/resume/output/`，不得覆盖三份现有简历文件。
- 使用 `Hiragino Sans GB` 作为中文字体，英文和数字使用 `Arial`；禁止图标字体、文本框、页眉、页脚和复杂表格。
- 实际简历文本使用 ASCII hyphen；日期统一为 `YYYY.MM - YYYY.MM` 或 `YYYY.MM - 至今`。
- 不读取 `.env`、token、OAuth secret 或 WalletConnect credential。
- 不修改作品集运行时代码、测试、依赖或现有迁移文档。
- 当前工作树含用户未提交改动；本计划不执行 commit、push、merge、rebase、发布或部署。
- 所有数字沿用已确认口径；不得把 commit 数、代码占比、Similarweb 流量或无法公开的业务数据写入投递版。

---

## File Structure

- Create: `docs/resume/output/高级前端开发工程师-中文主简历-202607.md`
  - 唯一内容真相，供人工审阅、JD 定向裁剪和 DOCX 生成使用。
- Create: `docs/resume/scripts/generate_senior_frontend_resume.py`
  - 读取固定 Markdown 文件，生成 A4 两页 DOCX；只负责排版，不改写内容。
- Create: `docs/resume/output/高级前端开发工程师-中文主简历-202607.docx`
  - 最终投递版。
- Temporary: `/tmp/resume-restructure/source/`
  - 现有 DOCX 文本抽取结果，不提交。
- Temporary: `/tmp/resume-restructure/rendered/`
  - PDF 和逐页 PNG，不提交，验收后删除。

---

### Task 1: 冻结来源与错误清单

**Files:**
- Read: `docs/resume/前端开发工程师-202607.docx`
- Read: `docs/resume/quest-price-senior-frontend-resume.docx`
- Read: `docs/resume/quest-price-senior-frontend-resume.md`
- Read: `docs/superpowers/specs/2026-07-15-senior-frontend-resume-restructure-design.md`
- Temporary: `/tmp/resume-restructure/source/*.txt`

**Interfaces:**
- Consumes: 现有简历中的姓名、联系方式、早期经历和教育；设计规格中的项目事实边界。
- Produces: 个人信息文本基线和旧版错误表述清单。

- [x] **Step 1: 提取两份 DOCX 正文**

Run:

```bash
mkdir -p /tmp/resume-restructure/source /tmp/resume-restructure/rendered
/Users/qiuyupan/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3 -c 'from pathlib import Path; from docx import Document; out=Path("/tmp/resume-restructure/source"); files=[Path("docs/resume/前端开发工程师-202607.docx"),Path("docs/resume/quest-price-senior-frontend-resume.docx")]; [(out/(p.stem+".txt")).write_text("\n".join(x.text for x in Document(p).paragraphs if x.text.strip()),encoding="utf-8") for p in files]'
```

Expected: 临时目录出现两个 UTF-8 文本文件，源 DOCX 未改变。

- [x] **Step 2: 核对不可变个人信息**

Run:

```bash
rg -n "Quest Price|成都|181|quest_9527@gmail.com|成都理工大学|四川工程职业技术学院|四川千行|杭州维码|四川金信石" docs/resume/quest-price-senior-frontend-resume.md /tmp/resume-restructure/source
```

Expected: 姓名、所在地、脱敏电话、邮箱、教育和早期公司信息一致；发现冲突时以原始简历为准，不自行推测。

- [x] **Step 3: 固定旧版禁止沿用的错误表述**

Run:

```bash
rg -n "10 年|2025\.04|2023\.12 - 至今|AMM|Swap 等核心|NFTScan \| 前端开发工程师" docs/resume/quest-price-senior-frontend-resume.md
```

Expected: 命中旧版需要修正的年限、日期、角色和 1DEX ownership 文案。

---

### Task 2: 编写两页主简历 Markdown

**Files:**
- Create: `docs/resume/output/高级前端开发工程师-中文主简历-202607.md`

**Interfaces:**
- Consumes: Task 1 的个人信息基线和设计规格中的事实口径。
- Produces: DOCX 生成器唯一读取的简历内容。

- [x] **Step 1: 使用 `apply_patch` 创建 Markdown 主稿**

主稿按以下内容写入；只允许依据原始简历修正不可变个人信息，不得扩张项目事实：

```markdown
# Quest Price

**高级前端开发工程师 | React / Next.js / Web3**

成都 | 181****0773 | quest_9527@gmail.com  
GitHub / 作品集：https://github.com/yohuohuohuo/my-portfolio-site

## 核心优势

- 11 年以上前端与客户端开发经验，其中 4 年以上 Web3 产品研发经验；以 React、Next.js 和 TypeScript 为主要技术栈，能够独立负责复杂产品从需求评审到上线维护的完整交付。
- 在 Mint Blockchain、1DEX 担任前端负责人，承担技术方案、任务拆解、Code Review 和进度推进；具备 3 人前端团队及跨城市远程团队协作经验。
- 具备 EVM、Solana、多钱包、合约交互、批量交易、复杂动画和响应式多端适配经验，同时承担过 Nest.js 接口开发。

## 技术技能

- 前端：TypeScript、JavaScript、React、Next.js、Vue、Angular、Zustand、React Query、Tailwind CSS
- Web3：EVM、Solana、wagmi、viem、ethers.js、RainbowKit、Dynamic Labs、@solana/web3.js
- 工程与交付：Git、Vercel、Webpack、Rollup、Playwright、Vitest、CI/CD、Code Review、Nest.js

## 工作经历

### NFTScan 产品团队 | 核心前端开发 / 项目前端负责人 | 2022.06 - 至今

- 先后承担 NFTScan、Mint Blockchain、1DEX 等产品的前端研发，覆盖 NFT 数据基础设施、Layer2 生态、DEX、多链资产处理和开发者 SDK。
- 在 Mint Blockchain 和 1DEX 项目承担前端负责人职责，负责技术方案、任务拆解、Code Review、发布和线上问题处理；在 1DEX 与跨城市团队通过文档和任务系统异步推进。
- 与产品、设计、后端及合约工程师协作，完成需求评审、工作量评估、开发联调、测试验收和生产发布闭环。

### 四川千行你我科技股份有限公司 | 前端开发工程师 | 2016.05 - 2022.06

- 负责 Web、Android、iOS 和微信小程序等多端产品研发，参与需求调研、可行性评估、版本发布和线上问题处理。
- 承担小组任务分配和进度管理，推动多个项目按期交付。

### 杭州维码 / 四川金信石信息技术有限公司 | Android 开发工程师 | 2014.10 - 2016.06

- 负责 Android 客户端功能开发、遗留模块维护、性能优化及上线后的用户反馈闭环。

## 精选项目

### 1DEX | 前端负责人 | 2025.05 - 2026.03

- 负责 3 人前端团队的任务拆解、技术方案、Code Review 和进度推进，在跨城市远程协作环境中完成测试、预览和生产版本交付。
- 从 0 到 1 负责 Small Balance Convertor 与 Multi-chain Gas Top-up，统一 EVM / Solana 资产筛选、批量交易预校验、订单提交、状态轮询和异常反馈流程。
- 针对钱包能力差异接入 MetaMask EIP-5792 `wallet_sendCalls`、OKX `executeFromSelf`；在 Solana 侧处理 ATA 创建、Legacy / V0 交易和 Address Lookup Table，单次支持最多 9 种 Token 的批量操作。
- 从 0 到 1 负责 Reward / Referral 模块，实现钱包签名登录、邀请关系、EVM / Solana 地址绑定、链上奖励领取、状态管理、多语言和移动端适配。

### Mint Blockchain | 前端负责人 | 2023.12 - 2025.09

- 在约 20 人团队中负责 3 人前端协作，覆盖 Mint 官网、Mint Forest DApp、Mint Swap 和 Mint Rich 的从 0 到 1 建设、发布、监控及线上问题处理。
- 一个月内独立完成 Mint Forest v3 全部前端并按期上线，负责从需求讨论、技术选型、开发验收到 Vercel 多环境发布和上线维护。
- 基于 Next.js、React、TypeScript、Zustand、Two.js、Motion 和 `@use-gesture/react` 实现 Canvas 地图、精灵动画、拖动、触摸、双指缩放、惯性移动、GreenID 动画及 Lucky Spin，并适配桌面端和主流移动端浏览器。
- 使用 RainbowKit、wagmi、viem 和 React Query 统一钱包与合约交互；Mint Forest 上线后三个月累计注册用户 40 万以上，Campaign 期间峰值日活数万，日活口径为当日完成链上交互的用户。

### NFTScan | 核心前端开发 | 核心阶段 2022.06 - 2025.02

- 从 0 到 1 建设 `nftscan-api` JavaScript SDK，覆盖 60 个以上 API 方法、11 条 EVM-like 链和 Solana，NPM 累计下载 3.3 万以上。
- 将 Solana NFT 展示能力整合进 EVM 主站，参与多链 NFT 浏览器、Portfolio、Site Builder、API 计费支付和 NFTFi 等模块的完整交付。
- 建设构建与发布脚本，统一产物修复、压缩、上传和远程部署，覆盖 EVM、Solana、Aptos 和 TON 项目，将人工发布操作由约 4 步缩减至 2 步。

## 教育经历

- 成都理工大学 | 本科（非全日制） | 工商管理 | 2019 - 2023
- 四川工程职业技术学院 | 大专 | 计算机网络技术 | 2011 - 2014
```

- [x] **Step 2: 检查关键事实和禁止内容**

Run:

```bash
rg -n "11 年以上|2025\.05 - 2026\.03|2023\.12 - 2025\.09|2022\.06 - 2025\.02|40 万以上|3\.3 万以上|60 个以上|最多 9 种" docs/resume/output/高级前端开发工程师-中文主简历-202607.md
! rg -n "10 年|2025\.04|AMM、Swap 等核心|Similarweb|commit|代码占比|精通|专家|Codex|Cursor" docs/resume/output/高级前端开发工程师-中文主简历-202607.md
```

Expected: 第一条命中全部关键事实；第二条无输出并返回成功。

- [x] **Step 3: 检查字符与结构**

Run:

```bash
/Users/qiuyupan/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3 -c 'from pathlib import Path; s=Path("docs/resume/output/高级前端开发工程师-中文主简历-202607.md").read_text(); lines=s.splitlines(); assert "‑" not in s; assert sum(x.startswith("## ") for x in lines)==5; assert sum(x.startswith("### ") for x in lines)==6; print(len(s), "characters")'
```

Expected: 断言通过并输出字符数。

---

### Task 3: 实现可复现的 DOCX 生成器

**Files:**
- Create: `docs/resume/scripts/generate_senior_frontend_resume.py`
- Read: `docs/resume/output/高级前端开发工程师-中文主简历-202607.md`
- Produce: `docs/resume/output/高级前端开发工程师-中文主简历-202607.docx`

**Interfaces:**
- Consumes: UTF-8 Markdown，支持 `#`、`##`、`###`、成对双星号粗体、反引号行内代码、普通段落和 `- ` 列表。
- Produces: `build_document(source: Path, target: Path) -> None`，生成 A4 单栏 DOCX。

- [x] **Step 1: 使用 `apply_patch` 创建生成器**

生成器按以下完整实现写入；首次渲染后只允许按 Task 4 的顺序调整版式常量：

```python
import re
from pathlib import Path

from docx import Document
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml.ns import qn
from docx.shared import Cm, Pt, RGBColor

ROOT = Path(__file__).resolve().parents[3]
SOURCE = ROOT / "docs/resume/output/高级前端开发工程师-中文主简历-202607.md"
TARGET = ROOT / "docs/resume/output/高级前端开发工程师-中文主简历-202607.docx"
CJK_FONT = "Hiragino Sans GB"
LATIN_FONT = "Arial"
BODY_COLOR = RGBColor(32, 39, 48)
ACCENT_COLOR = RGBColor(15, 78, 92)


def set_run_font(run, size: float, bold: bool = False, color=BODY_COLOR) -> None:
    run.font.name = LATIN_FONT
    run.font.size = Pt(size)
    run.font.bold = bold
    run.font.color.rgb = color
    run._element.get_or_add_rPr().get_or_add_rFonts().set(qn("w:eastAsia"), CJK_FONT)


def set_paragraph_spacing(paragraph, before: float, after: float, line: float = 1.0) -> None:
    paragraph.paragraph_format.space_before = Pt(before)
    paragraph.paragraph_format.space_after = Pt(after)
    paragraph.paragraph_format.line_spacing = line


def configure_document(document: Document) -> None:
    section = document.sections[0]
    section.page_width = Cm(21.0)
    section.page_height = Cm(29.7)
    section.top_margin = Cm(1.50)
    section.bottom_margin = Cm(1.50)
    section.left_margin = Cm(1.75)
    section.right_margin = Cm(1.75)

    normal = document.styles["Normal"]
    normal.font.name = LATIN_FONT
    normal.font.size = Pt(11)
    normal._element.rPr.rFonts.set(qn("w:eastAsia"), CJK_FONT)

    bullet = document.styles["List Bullet"]
    bullet.font.name = LATIN_FONT
    bullet.font.size = Pt(11)
    bullet._element.rPr.rFonts.set(qn("w:eastAsia"), CJK_FONT)
    bullet.paragraph_format.left_indent = Cm(0.45)
    bullet.paragraph_format.first_line_indent = Cm(-0.20)


def add_inline_markdown(paragraph, text: str, size: float, color=BODY_COLOR) -> None:
    parts = re.split(r"(\*\*[^*]+\*\*|`[^`]+`)", text)
    for part in parts:
        if not part:
            continue
        bold = part.startswith("**") and part.endswith("**")
        inline_code = part.startswith("`") and part.endswith("`")
        clean = part[2:-2] if bold else part[1:-1] if inline_code else part
        run = paragraph.add_run(clean)
        set_run_font(run, size, bold=bold or inline_code, color=color)


def add_name(document: Document, text: str) -> None:
    paragraph = document.add_paragraph()
    paragraph.alignment = WD_ALIGN_PARAGRAPH.CENTER
    set_paragraph_spacing(paragraph, 0, 1.5)
    set_run_font(paragraph.add_run(text), 22, bold=True, color=ACCENT_COLOR)


def add_role(document: Document, text: str) -> None:
    paragraph = document.add_paragraph()
    paragraph.alignment = WD_ALIGN_PARAGRAPH.CENTER
    set_paragraph_spacing(paragraph, 0, 3.5)
    set_run_font(paragraph.add_run(text), 12, bold=True, color=BODY_COLOR)


def add_contact(document: Document, text: str) -> None:
    paragraph = document.add_paragraph()
    paragraph.alignment = WD_ALIGN_PARAGRAPH.CENTER
    set_paragraph_spacing(paragraph, 0, 0.75)
    add_inline_markdown(paragraph, text, 9.5)


def add_section_heading(document: Document, text: str) -> None:
    paragraph = document.add_paragraph()
    paragraph.paragraph_format.keep_with_next = True
    if text == "精选项目":
        paragraph.paragraph_format.page_break_before = True
    set_paragraph_spacing(paragraph, 10, 3)
    set_run_font(paragraph.add_run(text), 13, bold=True, color=ACCENT_COLOR)


def add_entry_heading(document: Document, text: str) -> None:
    paragraph = document.add_paragraph()
    paragraph.paragraph_format.keep_with_next = True
    set_paragraph_spacing(paragraph, 5, 2)
    add_inline_markdown(paragraph, text, 11.5, color=BODY_COLOR)
    for run in paragraph.runs:
        run.bold = True


def add_bullet(document: Document, text: str) -> None:
    paragraph = document.add_paragraph(style="List Bullet")
    paragraph.paragraph_format.widow_control = True
    set_paragraph_spacing(paragraph, 0, 2.3, 1.15)
    add_inline_markdown(paragraph, text, 11)


def add_body(document: Document, text: str) -> None:
    paragraph = document.add_paragraph()
    set_paragraph_spacing(paragraph, 0, 2.3, 1.15)
    add_inline_markdown(paragraph, text, 11)


def build_document(source: Path, target: Path) -> None:
    document = Document()
    configure_document(document)
    document.core_properties.title = "高级前端开发工程师中文主简历"
    document.core_properties.subject = "Senior Frontend Engineer / Web3 Frontend Engineer"

    for raw_line in source.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line:
            continue
        if line.startswith("# "):
            add_name(document, line[2:])
        elif line.startswith("## "):
            add_section_heading(document, line[3:])
        elif line.startswith("### "):
            add_entry_heading(document, line[4:])
        elif line.startswith("- "):
            add_bullet(document, line[2:])
        elif line.startswith("**") and line.endswith("**"):
            add_role(document, line[2:-2])
        elif line.startswith("成都 |") or line.startswith("GitHub /"):
            add_contact(document, line)
        else:
            add_body(document, line)

    target.parent.mkdir(parents=True, exist_ok=True)
    document.save(target)


if __name__ == "__main__":
    build_document(SOURCE, TARGET)
```

- [x] **Step 2: 运行生成器**

Run:

```bash
/Users/qiuyupan/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3 docs/resume/scripts/generate_senior_frontend_resume.py
```

Expected: 生成目标 DOCX，退出码为 `0`。

- [x] **Step 3: 验证 DOCX 结构和文本**

Run:

```bash
/Users/qiuyupan/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3 -c 'from docx import Document; p="docs/resume/output/高级前端开发工程师-中文主简历-202607.docx"; d=Document(p); text="\n".join(x.text for x in d.paragraphs); required=["11 年以上","1DEX | 前端负责人 | 2025.05 - 2026.03","Mint Blockchain | 前端负责人 | 2023.12 - 2025.09","NFTScan | 核心前端开发 | 核心阶段 2022.06 - 2025.02","40 万以上","3.3 万以上"]; assert all(x in text for x in required); s=d.sections[0]; assert len(d.sections)==1 and round(s.page_width.cm,1)==21.0 and round(s.page_height.cm,1)==29.7; print(len(d.paragraphs), "paragraphs")'
```

Expected: 所有断言通过并输出段落数。

---

### Task 4: 渲染、检查并迭代两页布局

**Files:**
- Modify if required: `docs/resume/scripts/generate_senior_frontend_resume.py`
- Regenerate: `docs/resume/output/高级前端开发工程师-中文主简历-202607.docx`
- Temporary: `/tmp/resume-restructure/rendered/*`

**Interfaces:**
- Consumes: Task 3 的 DOCX。
- Produces: 严格两页、无乱码和溢出的最终 DOCX。

- [x] **Step 1: 使用 DOCX helper 渲染**

Run:

```bash
rm -rf /tmp/resume-restructure/rendered
mkdir -p /tmp/resume-restructure/rendered
/Users/qiuyupan/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3 /Users/qiuyupan/.codex/skills/doc/scripts/render_docx.py docs/resume/output/高级前端开发工程师-中文主简历-202607.docx --output_dir /tmp/resume-restructure/rendered
```

Expected: 生成 PDF 和逐页 PNG，中文字符正常。

- [x] **Step 2: 验证 PDF 严格两页**

Run:

```bash
/Users/qiuyupan/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/override/pdfinfo /tmp/resume-restructure/rendered/高级前端开发工程师-中文主简历-202607.pdf | rg '^Pages:\s+2$'
```

Expected: 输出 `Pages: 2`。

- [x] **Step 3: 使用 `view_image` 逐页检查原图**

每页检查中文字符、层级、字号、裁切、项目标题孤行、项目符号缩进和上下页密度。第二页可有少量留白，不得出现半页空白。

- [x] **Step 4: 视觉失败时按固定顺序调整**

1. 分节前后间距每次调整 `0.5 pt`。
2. 列表 after spacing 每次调整 `0.25 pt`。
3. 上下边距每次最多调整 `0.05 cm`，不得小于 `1.10 cm`。
4. 正文字号最低 `9.2 pt`。
5. 仍超过两页时删减重复的工作经历概述，不删除项目量化事实。

每次调整后重新生成、渲染、检查页数并逐页查看。

---

### Task 5: 最终文本、文件和 Git scope 验收

**Files:**
- Verify: `docs/resume/output/高级前端开发工程师-中文主简历-202607.md`
- Verify: `docs/resume/output/高级前端开发工程师-中文主简历-202607.docx`
- Verify: `docs/resume/scripts/generate_senior_frontend_resume.py`

**Interfaces:**
- Consumes: Task 2-4 的最终产物。
- Produces: 可交付文件、验证结果和明确的未修改范围。

- [x] **Step 1: 比较 Markdown 与 DOCX 的关键文本**

Run:

```bash
/Users/qiuyupan/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3 -c 'from pathlib import Path; from docx import Document; md=Path("docs/resume/output/高级前端开发工程师-中文主简历-202607.md").read_text(); dx="\n".join(p.text for p in Document("docs/resume/output/高级前端开发工程师-中文主简历-202607.docx").paragraphs); keys=["Quest Price","11 年以上","Small Balance Convertor","wallet_sendCalls","Mint Forest v3","40 万以上","nftscan-api","3.3 万以上","成都理工大学"]; missing=[x for x in keys if x not in md or x not in dx]; assert not missing, missing; print("key text matched")'
```

Expected: 输出 `key text matched`。

- [x] **Step 2: 审核本任务文件范围**

Run:

```bash
find docs/resume/output docs/resume/scripts -maxdepth 1 -type f -print | sort
git status --short
```

Expected: 本任务新增文件仅为 Markdown、DOCX 和生成脚本；已有作品集修改保持原状。

- [x] **Step 3: 删除临时渲染文件**

Run:

```bash
rm -rf /tmp/resume-restructure
```

Expected: 临时文本、PDF 和 PNG 删除；最终文件保留。

- [x] **Step 4: 输出交付报告**

报告包含 Markdown/DOCX 绝对路径、PDF 实际页数、文本/结构/视觉验证、Git scope、脱敏电话限制，以及未 commit、未 push、未 merge、未发布、未部署的边界。

---

## Plan Self-Review

- Spec coverage：定位、项目事实、角色边界、量化口径、两页布局、ATS、字体、原文件保护和渲染验收均有对应任务。
- Placeholder scan：计划中的代码步骤均给出完整实现，没有未决标记或省略函数体。
- Interface consistency：Markdown 路径、DOCX 路径、生成函数签名和渲染目录在所有任务中一致。
- Scope decision：简历内容、生成脚本和渲染验证构成同一交付链，不拆分。
- Publication boundary：不执行 commit、push、merge、rebase、发布或部署。
