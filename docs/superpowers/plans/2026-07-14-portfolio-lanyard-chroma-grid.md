# Portfolio Lanyard And Chroma Grid Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a dark portfolio home page with a randomly selected, desktop-only Lanyard hero and accessible Chroma Grid project cards.

**Architecture:** Keep `projects` as the only portfolio content source. A client-only hero owns one random selection and shares it with the desktop physics Canvas or the mobile/reduced-motion static feature. The project grid retains semantic cards and link behavior while a project-owned pointer effect supplies chromatic hover feedback.

**Tech Stack:** Next.js Pages Router, React 19, TypeScript, Tailwind CSS v4, Three.js, React Three Fiber 9, Drei, Rapier, MeshLine, GSAP, Playwright.

## Global Constraints

- Keep all Lanyard assets under `public/projects/portfolio/lanyard`; no runtime remote asset requests.
- Do not alter `src/projects/mint-forest`, its dependencies, or its runtime audit boundaries.
- Keep internal projects as Next `Link` and external projects as `target="_blank"` with `rel="noopener noreferrer"`.
- Render Canvas only on pointer-capable desktop; render a static equivalent for mobile and reduced motion.
- Use `apply_patch` for handwritten source/docs edits and Yarn v1 for dependency/lockfile changes.
- Do not push, merge, rebase, publish or deploy.

---

### Task 1: Add Local Lanyard Runtime And Test Contract

**Files:**
- Modify: `package.json`
- Modify: `yarn.lock`
- Create: `public/projects/portfolio/lanyard/card.glb`
- Create: `public/projects/portfolio/lanyard/lanyard.png`
- Modify: `tests/e2e/portfolio.spec.ts`

**Interfaces:**
- Produces local Three.js/Fiber/Rapier dependencies and a project-owned `card.glb` asset.
- Adds stable locators: `portfolio-featured`, `portfolio-lanyard`, `portfolio-mobile-featured` and `project-<id>`.

- [x] **Step 1: Add failing browser assertions**

```ts
await expect(page.getByTestId('portfolio-featured')).toBeVisible();
await expect(page.getByTestId('portfolio-lanyard')).toBeVisible();
await expect(page.getByTestId('portfolio-lanyard').locator('canvas')).toBeVisible();
```

The mobile project must instead assert a visible `portfolio-mobile-featured` and zero `portfolio-lanyard` elements.

- [x] **Step 2: Run the focused test and confirm RED**

```bash
npm run test:e2e -- tests/e2e/portfolio.spec.ts --reporter=line --timeout=30000
```

Expected: assertions fail because neither featured hero nor Lanyard locators exist.

- [x] **Step 3: Install exact runtime dependencies and localize the model**

```bash
yarn add three @react-three/fiber @react-three/drei @react-three/rapier meshline gsap
curl --fail --location --output public/projects/portfolio/lanyard/card.glb \
  https://raw.githubusercontent.com/DavidHDev/react-bits/main/src/assets/lanyard/card.glb
curl --fail --location --output public/projects/portfolio/lanyard/lanyard.png \
  https://raw.githubusercontent.com/DavidHDev/react-bits/main/src/assets/lanyard/lanyard.png
file public/projects/portfolio/lanyard/card.glb public/projects/portfolio/lanyard/lanyard.png
```

Expected: Yarn updates only `package.json` and `yarn.lock`; `file` identifies a valid glTF binary asset.

### Task 2: Implement Random Featured Project And Lanyard Surface

**Files:**
- Create: `src/portfolio/components/portfolio-featured.tsx`
- Create: `src/portfolio/components/portfolio-lanyard.tsx`
- Create: `src/portfolio/components/portfolio-featured-link.tsx`
- Modify: `src/portfolio/components/portfolio-page.tsx`

**Interfaces:**

```ts
export interface FeaturedProjectProps {
  project: PortfolioProject;
  mode: 'desktop' | 'mobile' | 'reduced-motion';
}

export function getRandomProject(items: readonly PortfolioProject[], random = Math.random): PortfolioProject;
```

- [x] **Step 1: Write the failing random-selection unit test**

```ts
expect(getRandomProject(projects, () => 0)).toBe(projects[0]);
expect(getRandomProject(projects, () => 0.999)).toBe(projects.at(-1));
```

- [x] **Step 2: Implement `getRandomProject` and an isomorphic hero**

`PortfolioFeatured` selects once after client mount, passes the result to both the desktop and mobile branches, and shows only a non-interactive skeleton before selection. It never writes browser storage.

- [x] **Step 3: Implement `PortfolioFeaturedLink`**

Use the same internal/external branch as `ProjectCard`; title, description, tags and CTA remain semantic HTML outside the Canvas.

- [x] **Step 4: Implement `PortfolioLanyard` as a client-only scene**

Load `/projects/portfolio/lanyard/card.glb` and `project.cover` through Three loaders, configure one Rapier physics world, and accept pointer drag only inside the Canvas. `PortfolioPage` must import it with `dynamic(() => import(...), { ssr: false })`.

- [x] **Step 5: Run the focused tests and typecheck**

```bash
npm run test:unit
npx tsc --noEmit
npm run test:e2e -- tests/e2e/portfolio.spec.ts --reporter=line --timeout=30000
```

Expected: hero selection and desktop/mobile contracts pass with no hydration/type errors.

### Task 3: Replace The Project Grid With Dark Chroma Cards

**Files:**
- Modify: `src/portfolio/components/project-card.tsx`
- Create: `src/portfolio/components/chroma-project-grid.tsx`
- Modify: `src/portfolio/components/portfolio-page.tsx`
- Modify: `src/portfolio/styles/portfolio.module.css`
- Create: `src/portfolio/styles/chroma-project-card.module.css`
- Modify: `tests/e2e/portfolio.spec.ts`

**Interfaces:**

```ts
interface ProjectCardProps {
  project: PortfolioProject;
  chromaIndex: number;
}
```

- [x] **Step 1: Add failing interaction assertions**

```ts
const card = page.getByTestId('project-10xprotocol');
await card.hover();
await expect(card).toHaveAttribute('data-chroma-active', 'true');
```

The mobile assertion must confirm no hover-only control appears and the existing visible outbound link remains usable.

- [x] **Step 2: Implement pointer-controlled chroma state**

Adapt the official ChromaGrid pointer interpolation with GSAP, preserve project card link semantics, and set `data-chroma-active` on enter and clear it on leave. GSAP is added because the React Bits reference uses it for the chromatic mask interpolation; `motion` remains untouched.

- [x] **Step 3: Apply dark surface tokens and stable project hues**

Use a near-black page background, dark cards, readable warm-white text and per-index hue custom properties. Keep 16:9 cover media, text flow, card radius and link target dimensions stable.

- [x] **Step 4: Add motion and mobile fallbacks**

Disable perspective/glow transitions under `prefers-reduced-motion: reduce`, `pointer: coarse` and the mobile breakpoint. Do not hide content or links.

- [x] **Step 5: Run desktop/mobile E2E and inspect screenshots**

```bash
npm run test:e2e -- tests/e2e/portfolio.spec.ts --reporter=line --timeout=30000
```

Expected: all six portfolio tests pass across both configured viewports.

### Task 4: Verify Local Runtime And Record The Result

**Files:**
- Modify: `HANDOFF.md`

- [x] **Step 1: Run static, unit, route and browser verification**

```bash
npm run test:unit
npm run verify:routes
npm run verify:runtime
npx tsc --noEmit
npm run test:e2e
```

- [x] **Step 2: Capture visual evidence**

At `1440x900`, verify the Lanyard canvas is nonblank, its selected project CTA opens the configured destination, and every Chroma card text/link remains legible. At `390x844`, verify there is no Canvas and the static featured card matches the selected project.

- [x] **Step 3: Update handoff and inspect Git scope**

```bash
git diff --check
git status --short --branch
```

Record exact command outcomes, local Lanyard asset path, the mobile fallback and known warnings. Do not commit, push, merge or deploy unless the user explicitly requests it.
