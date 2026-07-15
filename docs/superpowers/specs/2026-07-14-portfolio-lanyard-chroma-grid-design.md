# Portfolio Lanyard And Chroma Grid Design

状态：用户已确认执行（2026-07-14）

## Goal

将 `/` 从浅色静态项目入口改造成暗色项目展示页：桌面端在顶部显示随机项目的 3D Lanyard，项目列表使用 Chroma Grid 风格的 hover 色散效果；移动端不加载 WebGL，显示同一随机项目的静态 featured card。

## Scope And Boundaries

- 仅修改 `src/portfolio`、`public/projects/portfolio`、`package.json`、`yarn.lock`、入口 E2E 和项目文档。
- Mint Forest 的运行时代码、资源与网络边界不变；不得在 Mint Forest runtime 中引入 Three.js 或 React Bits 资源。
- Lanyard 的 GLB 模型和所选项目封面都必须是同源本地资源。不得在浏览器运行时加载 React Bits、GitHub 或其他远程资源。
- 不新增站内项目路由；内部/外链项目继续沿用现有 `href`、`Link` 和 outbound anchor 行为。

## Interaction Model

### Project Selection

- 每次完整页面加载后，由客户端从 `projects` 中均匀随机选择一个项目。
- 选择结果只保存在 React state，不写入 `localStorage`；刷新页面时重新抽取。
- 选中的项目同时驱动 desktop Lanyard、mobile featured card 和可访问的标题/描述/CTA，确保两种断点没有内容漂移。

### Desktop Lanyard

- `min-width: 768px` 时，顶部 hero 渲染一个 client-only Lanyard Canvas。
- Canvas 负责鼠标拖拽与惯性摆动；项目名称、标签和 CTA 保持为 Canvas 外的 HTML，保证 keyboard、screen reader 与外链行为。
- `prefers-reduced-motion: reduce` 时，不启动物理模拟，改为静态 project cover 和同一 HTML CTA。

### Mobile Fallback

- `max-width: 767px` 时，完全不挂载 WebGL Canvas、物理世界或模型下载。
- 显示与 desktop 随机结果一致的 featured card，使用项目封面、名称、描述、tags 与 CTA。

### Chroma Project Grid

- 保留每个项目卡片的原有信息和链接语义。
- Pointer 设备上，卡片以 CSS variables 接收相对 pointer 坐标，显示 chromatic border、低强度 glow 和轻微 perspective tilt。
- Touch、keyboard 和 reduced-motion 环境保持静态卡片，不依赖 hover 才能访问链接或了解项目信息。

## Visual Direction

- 页面背景为近黑色，表面采用深灰蓝，正文为暖白，次要文字为低饱和灰。
- 每张卡片的 chroma 色相由稳定 project id 映射，避免随机颜色导致截图和视觉基调漂移。
- 卡片仍保持小圆角，hero 是未嵌套的全宽展示区；网格不是套在浮动 page card 内。

## Technical Design

- 使用 `three`、`@react-three/fiber`、`@react-three/drei` 与 `@react-three/rapier` 实现单一 hero Canvas；React 19 使用 Fiber 9。
- 官方 Lanyard 模型复制到 `public/projects/portfolio/lanyard/card.glb`；任何从 React Bits 参考的源码都迁入 `src/portfolio/components` 并只引用本地资产。
- 用 Next `dynamic(..., { ssr: false })` 隔离 WebGL，防止 Pages Router 的 SSR window/WebGL 访问和随机选择 hydration mismatch。
- 不将现有横向封面转换成远程纹理；Lanyard 只以所选 `project.cover` 作为本地纹理，Canvas 外 HTML 负责完整项目信息。

## Verification

- E2E 覆盖 desktop Lanyard canvas、随机 featured project 的可用 CTA、外链属性、desktop chroma pointer state 以及 mobile 静态 fallback。
- 浏览器网络记录必须只包含 localhost 静态资源；确认 GLB 与 cover 成功加载，且没有外部请求、图片 404 或 Canvas 空白。
- 在 `1440x900` 与 `390x844` 截图检查 hero、卡片文本、CTA、滚动与移动 fallback。
