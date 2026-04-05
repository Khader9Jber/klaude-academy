# What I Built & What's Next

A personal refresher for when you come back to this project after a break.

---

## What You Built

Claude Academy is a complete interactive learning website for mastering Claude and Claude Code. It has 74 lessons across 13 modules organized in 4 skill arcs (Foundation, Practitioner, Power User, Expert), 294 quiz questions, interactive exercises, a dark-mode-first design, and it's deployed to 2 platforms. The whole thing is a static site -- no backend, no database, zero hosting cost.

---

## How It Works

- You write lessons as MDX files in `content/modules/`. Each module has a `_module.json` for metadata and numbered `.mdx` files for lessons.
- Push to `main` and the pipeline kicks in: lint, typecheck, unit tests, E2E tests, security scan, then auto-deploys to both GitHub Pages and Vercel.
- Progress (completed lessons, quiz scores, streaks, achievements) is tracked in the user's browser via localStorage. No accounts needed.
- No backend. The entire site is pre-rendered to static HTML/CSS/JS at build time. Anyone can host it anywhere.

---

## Quick Commands

```bash
npm run dev            # Local dev server (http://localhost:3000)
npm run build          # Production build (outputs to /out)
npm test               # Unit tests (46 tests)
npm run test:coverage  # With coverage report
npm run test:e2e       # Playwright E2E tests (36 tests)
npm run lint           # ESLint
git push               # Auto-deploys via pipeline
```

---

## Your Live URLs

- **Vercel**: https://claude-academy-course.vercel.app
- **GitHub Pages**: https://khader9jber.github.io/claude-academy/
- **Repo**: https://github.com/Khader9Jber/claude-academy
- **Pipeline**: https://github.com/Khader9Jber/claude-academy/actions

---

## Project Stats

- 74 lessons, 294 quiz questions, 13 modules, 4 arcs
- 46 unit tests, 36 E2E tests, 97% statement coverage, 100% function coverage
- 4 CI/CD workflows, dual deployment (GitHub Pages + Vercel)
- 6 project docs (SRS, Test Plan, Test Suites, Architecture, Implementation Plan, Glossary)
- QA reports: content validation, build report, completeness audit

---

## Key Files to Know

| What | Where |
|------|-------|
| Lessons | `content/modules/XX-name/*.mdx` |
| Module config | `content/modules/XX-name/_module.json` |
| Components | `src/components/{ui,content,interactive,lesson,progress,search}/` |
| Pages | `src/app/{page,curriculum,prompt-lab,cheatsheet,templates,progress}/` |
| Design system | `src/app/globals.css` (CSS variables + Tailwind theme) |
| Progress store | `src/lib/store.ts` + `src/lib/progress-store.ts` |
| Content loader | `src/lib/content.ts` |
| Constants | `src/lib/constants.ts` (site name, arcs, module order, achievements) |
| E2E tests | `e2e/*.spec.ts` |
| Page objects | `e2e/pages/*.page.ts` |
| CI pipeline | `.github/workflows/{ci,security,deploy,pr-preview}.yml` |
| Vitest config | `vitest.config.ts` |
| Playwright config | `playwright.config.ts` |
| Docs | `docs/` |
| Tech stack | `TECH_STACK.md` |

---

## How to Add a New Lesson

1. Create `content/modules/XX-name/NN-slug.mdx` with frontmatter:
   ```yaml
   ---
   title: "Your Lesson Title"
   slug: "your-lesson-slug"
   order: 5
   difficulty: "beginner"
   duration: 15
   tags: ["tag1", "tag2"]
   objectives:
     - "First learning objective"
     - "Second learning objective"
   quiz:
     - question: "Your quiz question?"
       type: "multiple-choice"
       options: ["A", "B", "C", "D"]
       correct: 0
       explanation: "Why A is correct"
   ---
   ```
2. Write your lesson content in MDX below the frontmatter. You can embed Quiz, FillInBlank, TerminalSimulator, Callout, CodeBlock, etc.
3. Push to main. The pipeline runs, tests pass, and it auto-deploys.

---

## How to Add a New Module

1. Create `content/modules/XX-name/_module.json`:
   ```json
   {
     "title": "Your Module",
     "slug": "your-module",
     "description": "What this module covers",
     "arc": "foundation",
     "order": 14,
     "icon": "brain",
     "color": "#5cb870",
     "estimatedHours": 2,
     "prerequisites": [],
     "lessonCount": 5
   }
   ```
2. Add lessons as MDX files in the same directory.
3. Update `src/lib/constants.ts` -- add your module slug to the `MODULE_ORDER` array.
4. Push to main. It auto-deploys.

---

## What's Next -- Improvement Roadmap

### High Priority

- [ ] Enrich lessons 50-100 with more specific examples and code snippets (currently more templated than lessons 1-20)
- [ ] Add Sandpack code exercises to Practitioner and Advanced modules
- [ ] Arabic language support (RTL layout, translated content)
- [ ] Backend with Supabase (user accounts, cross-device progress sync)

### Medium Priority

- [ ] Accessibility audit (WCAG 2.1 AA compliance)
- [ ] Performance optimization (Lighthouse 95+ target)
- [ ] OG images for social sharing
- [ ] Fuse.js search integration (currently hardcoded search data)
- [ ] Custom domain setup
- [ ] More E2E tests for quiz flows and exercise validation
- [ ] Visual regression testing with Playwright screenshots

### Low Priority / Future

- [ ] Completion certificates (PDF generation)
- [ ] Leaderboards and gamification
- [ ] Community comments on lessons
- [ ] Payment integration for premium content
- [ ] Mobile app (React Native)
- [ ] Podcast/video embeds in lessons
- [ ] Multi-language support beyond Arabic
- [ ] Admin dashboard for content management

---

## Architecture Decisions (Why We Did It This Way)

Quick reference to key decisions. Full details in `docs/ARCHITECTURE.md` (Section 12) and `docs/IMPLEMENTATION_PLAN.md` (Section 4).

1. **Static-first (no backend)** -- Zero hosting cost, instant page loads, maximum privacy. All user data stays in the browser. Adding a backend later only requires swapping the Zustand persist storage adapter (~50 lines of code).

2. **MDX for lessons** -- Authors write Markdown and can embed React components (Quiz, FillInBlank, TerminalSimulator) directly in the content. Content is version-controlled in Git. No CMS dependency.

3. **Zustand + localStorage** -- Zustand is 2KB gzipped with built-in persist middleware. One line of config gives you localStorage persistence. No Redux boilerplate, no database needed.

4. **data-testid for testing** -- Stable selectors that survive UI redesigns, text changes, and DOM restructuring. Page object locators use `page.getByTestId()` exclusively, so tests never break when you change CSS classes or copy.

5. **Page Object Model for E2E** -- Each page has a corresponding class in `e2e/pages/`. When the UI changes, you update one page object instead of every test that touches that page. Tests read like user stories.

6. **Dual deploy (GitHub Pages + Vercel)** -- Redundancy: if one platform has issues, the other is still up. Different audiences can use different URLs. GitHub Pages is free and tied to the repo; Vercel gives you preview deploys on PRs.

7. **4 separate CI workflows** -- Separation of concerns. CI runs on every push. Security scans run on pushes and weekly. Deploy only runs on main. PR previews only run on PRs. Each workflow has minimal permissions.

---

## If Something Breaks

1. **Check the pipeline**: https://github.com/Khader9Jber/claude-academy/actions
   - Look at the most recent workflow run. Red means failure -- click into it to see which job failed and read the logs.

2. **Run locally**:
   ```bash
   npm run dev
   ```
   Open http://localhost:3000 and check if it works.

3. **Check types**:
   ```bash
   npx tsc --noEmit
   ```
   This catches TypeScript errors that ESLint might miss.

4. **Check lint**:
   ```bash
   npm run lint
   ```

5. **Run tests**:
   ```bash
   npm test              # Unit tests
   npm run test:e2e      # E2E tests (needs dev server running or will auto-start one)
   ```

6. **Check coverage**:
   ```bash
   npm run test:coverage
   ```
   If coverage drops below 90% statements, the CI will fail. Check `coverage/index.html` for a detailed report.

7. **Common issues**:
   - "Module not found" -- check that the module slug is in `MODULE_ORDER` in `src/lib/constants.ts`
   - "Build fails" -- run `npm run build` locally and read the error. Usually a TypeScript error or missing content file.
   - "E2E test fails" -- check `playwright-report/index.html` for screenshots and traces. The most common cause is a missing `data-testid` on a new element.
   - "Deploy fails" -- check that `VERCEL_TOKEN`, `VERCEL_ORG_ID`, and `VERCEL_PROJECT_ID` secrets are set in the repo settings.
