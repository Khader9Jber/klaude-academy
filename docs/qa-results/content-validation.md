# Content Validation Report

**Date:** 2026-04-12
**Validator:** scripts/validate-content.ts

---

## Summary

| Metric | Value |
|--------|-------|
| Total MDX files checked | 169 |
| Files passing all checks | 169 |
| Files with issues | 0 |
| Pass rate | 100.0% |

## Content Statistics

| Metric | Value |
|--------|-------|
| Total quiz questions | 678 |
| Average lesson duration | 18.3 min |
| Total curriculum time | 3101 min (51.7h) |

### Difficulty Distribution

| Difficulty | Count |
|------------|-------|
| Beginner | 35 |
| Intermediate | 63 |
| Advanced | 30 |
| Expert | 41 |

### Lessons Per Module

| Module | MDX Files |
|--------|-----------|
| 01-claude-fundamentals | 6 |
| 02-prompt-engineering | 10 |
| 03-claude-code-basics | 6 |
| 04-commands-and-navigation | 6 |
| 05-claude-md-and-config | 8 |
| 06-session-and-context | 7 |
| 07-git-and-workflows | 8 |
| 08-mcp-fundamentals | 7 |
| 09-hooks-and-automation | 7 |
| 10-agents-and-skills | 9 |
| 11-advanced-workflows | 9 |
| 12-enterprise-and-production | 9 |
| 13-capstone | 5 |
| 14-real-world-projects | 6 |
| 15-claude-for-teams | 5 |
| 16-claude-api-sdk | 6 |
| 17-claude-security | 5 |
| 18-tips-and-tricks | 7 |
| 19-claude-qa | 6 |
| 20-claude-web-dev | 5 |
| 21-claude-devops | 5 |
| 22-claude-content | 5 |
| 23-claude-data-science | 5 |
| 24-claude-mobile | 5 |
| 25-claude-databases | 5 |
| 26-ai-fluency | 7 |

---

## Issues

No issues found. All 169 files pass all validation checks.

---

## Validation Checks Performed

1. Valid YAML frontmatter (parseable with gray-matter)
2. Required fields present: title, slug, order, difficulty, duration
3. Difficulty is one of: beginner, intermediate, advanced, expert
4. Duration is a positive number
5. Quiz questions have: id, question, options (array), correct (number), explanation
6. Content body is non-empty (at least 100 characters)
7. File is in the correct module directory
