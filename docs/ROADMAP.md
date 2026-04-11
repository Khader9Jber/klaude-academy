# Klaude Academy Roadmap

Last updated: 2026-04-11

## P0 — Critical (must-have for production quality)

- [x] **Custom 404 page** — branded not-found page with navigation back to curriculum
- [x] **Global error boundary** — `error.tsx` with graceful error handling and retry
- [x] **Skip-to-content link** — accessibility requirement for keyboard/screen reader users
- [x] **Lesson 01 quiz questions** — "What Is Claude" already had quiz questions (confirmed)
- [x] **SEO meta improvements** — per-page Open Graph tags, structured data (JSON-LD), canonical URLs, per-lesson metadata
- [x] **Sitemap generation** — dynamic sitemap.xml for all curriculum pages

## P1 — High Priority (significantly improves UX)

- [x] **Reading progress indicator** — scroll-based progress bar at the top of lesson pages
- [x] **Scroll-to-top button** — floating button that appears after scrolling down on long pages
- [x] **Estimated reading time** — calculated from word count (200 wpm for technical content), replaces hardcoded duration on lesson pages
- [ ] **Keyboard accessibility audit** — ensure all interactive components (quiz, fill-in-blank, terminal sim, search) are fully keyboard-navigable
- [x] **Focus trap for modals** — search dialog has `role="dialog"`, `aria-modal`, and `aria-label` attributes
- [ ] **Search data from actual content** — replace hardcoded LESSON_DATA with real curriculum data
- [x] **Print styles** — CSS `@media print` rules for clean lesson printing

## P2 — Medium Priority (nice polish)

- [ ] **Smooth scroll for TOC links** — anchor links in the right sidebar should smooth-scroll
- [ ] **Active TOC highlighting** — highlight current section in the table of contents as user scrolls
- [ ] **Heading anchor links** — hover-to-reveal anchor links on h2/h3 headings for easy sharing
- [ ] **Code block copy button** — one-click copy for code snippets in lessons
- [ ] **Image lazy loading** — explicit lazy loading attributes on content images
- [x] **Lesson word count / reading time utility** — `estimateReadingTime()` and `wordCount()` in utils.ts
- [ ] **Better mobile lesson navigation** — slide-out drawer for lesson sidebar on mobile
- [ ] **Breadcrumb structured data** — JSON-LD BreadcrumbList on lesson pages
- [ ] **Performance: dynamic imports** — lazy load heavy components (framer-motion, search dialog)
- [ ] **Link prefetching hints** — prefetch next/prev lesson pages for instant navigation

## P3 — Nice to Have (future enhancements)

- [ ] **OG image generation** — auto-generated Open Graph images per lesson/module
- [ ] **Visual regression tests** — Playwright screenshot comparison tests
- [ ] **Community comments** — discussion section under each lesson (requires backend)
- [ ] **RSS feed** — for lesson updates and new content
- [ ] **Offline support** — service worker for offline lesson reading
- [ ] **Content search with Fuse.js** — full-text search across all lesson content
- [ ] **Analytics events** — track lesson views, quiz completions, time-on-page (client-side)
- [ ] **Lesson bookmarks** — save lessons to read later
- [ ] **Font size controls** — user preference for lesson content font size
- [x] **Reduce motion support** — `prefers-reduced-motion` media query in globals.css
- [ ] **Color contrast audit** — verify all color combinations meet WCAG AA

## Implementation Notes

Features marked with no external dependencies can be implemented immediately.
Features requiring API keys, database changes, or new npm packages are noted in P3.
