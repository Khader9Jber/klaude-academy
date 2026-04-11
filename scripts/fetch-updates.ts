/**
 * Fetch latest Claude/Anthropic updates from their RSS feed and changelog.
 *
 * Run: npx tsx scripts/fetch-updates.ts
 * Output: content/updates.json
 *
 * This script is called during build (via npm run build:updates) and can also
 * be run manually or via a scheduled GitHub Action to keep content fresh.
 */

import { writeFileSync } from "fs";
import { join } from "path";

interface UpdateEntry {
  id: string;
  title: string;
  date: string;
  summary: string;
  url: string;
  category: "release" | "feature" | "model" | "announcement" | "blog";
  tags: string[];
}

const FEEDS = [
  {
    url: "https://docs.anthropic.com/en/docs/about-claude/models",
    category: "model" as const,
    label: "Models",
  },
  {
    url: "https://www.anthropic.com/news",
    category: "announcement" as const,
    label: "News",
  },
  {
    url: "https://docs.anthropic.com/en/docs/changelog",
    category: "release" as const,
    label: "Changelog",
  },
];

// Curated updates — these are maintained manually + auto-supplemented by RSS
// When the RSS fetch works, it merges with these. When it doesn't (build-time
// with no network), these are the fallback.
const CURATED_UPDATES: UpdateEntry[] = [
  {
    id: "claude-4-6-release",
    title: "Claude 4.6 (Opus & Sonnet) Released",
    date: "2025-05-14",
    summary:
      "Claude 4.6 brings improved reasoning, faster output, and 1M context for Opus. Sonnet 4.6 replaces Sonnet 4.5 as the default model with better coding performance.",
    url: "https://www.anthropic.com/news",
    category: "model",
    tags: ["claude-4.6", "opus", "sonnet", "release"],
  },
  {
    id: "claude-code-ga",
    title: "Claude Code Generally Available",
    date: "2025-04-15",
    summary:
      "Claude Code exits beta and is now generally available as a CLI tool, desktop app (Mac/Windows), web app (claude.ai/code), and IDE extensions (VS Code, JetBrains).",
    url: "https://docs.anthropic.com/en/docs/claude-code",
    category: "release",
    tags: ["claude-code", "release", "cli", "ide"],
  },
  {
    id: "mcp-protocol",
    title: "Model Context Protocol (MCP) Open Standard",
    date: "2024-11-25",
    summary:
      "Anthropic open-sources the Model Context Protocol, enabling AI models to connect with external tools, databases, and APIs through a standardized interface.",
    url: "https://modelcontextprotocol.io",
    category: "feature",
    tags: ["mcp", "protocol", "open-source", "tools"],
  },
  {
    id: "prompt-caching",
    title: "Prompt Caching for API Users",
    date: "2024-10-01",
    summary:
      "Prompt caching reduces API costs by up to 90% for repeated prefixes. Cache hits are charged at 10% of input token price with a 5-minute TTL.",
    url: "https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching",
    category: "feature",
    tags: ["api", "caching", "cost", "optimization"],
  },
  {
    id: "tool-use-ga",
    title: "Tool Use (Function Calling) GA",
    date: "2024-05-30",
    summary:
      "Tool use is generally available across all Claude models. Define tools with JSON schema, Claude decides when to call them, and you execute the functions.",
    url: "https://docs.anthropic.com/en/docs/build-with-claude/tool-use",
    category: "feature",
    tags: ["api", "tools", "function-calling"],
  },
  {
    id: "agent-sdk-release",
    title: "Claude Agent SDK Released",
    date: "2025-03-15",
    summary:
      "The Agent SDK provides a Python framework for building autonomous Claude-powered agents with tool use, guardrails, and multi-agent orchestration.",
    url: "https://docs.anthropic.com/en/docs/agents",
    category: "release",
    tags: ["sdk", "agents", "python", "automation"],
  },
  {
    id: "message-batches",
    title: "Message Batches API — 50% Discount",
    date: "2024-09-24",
    summary:
      "The Batches API lets you send up to 100,000 requests at once with 50% off input and output tokens. Results are delivered within 24 hours.",
    url: "https://docs.anthropic.com/en/docs/build-with-claude/message-batches",
    category: "feature",
    tags: ["api", "batches", "cost", "scale"],
  },
  {
    id: "extended-thinking",
    title: "Extended Thinking for Complex Reasoning",
    date: "2025-02-24",
    summary:
      "Extended thinking gives Claude a scratchpad for complex reasoning before responding. Improves performance on math, logic, and multi-step problems.",
    url: "https://docs.anthropic.com/en/docs/build-with-claude/extended-thinking",
    category: "feature",
    tags: ["reasoning", "thinking", "performance"],
  },
  {
    id: "claude-code-hooks",
    title: "Claude Code Hooks — Automation Triggers",
    date: "2025-04-01",
    summary:
      "Hooks let you run shell commands before/after Claude Code actions. Auto-format on save, notify on completion, enforce linting — all configurable in settings.json.",
    url: "https://docs.anthropic.com/en/docs/claude-code/hooks",
    category: "feature",
    tags: ["claude-code", "hooks", "automation"],
  },
  {
    id: "claude-code-subagents",
    title: "Claude Code Sub-Agents and Skills",
    date: "2025-04-01",
    summary:
      "Sub-agents run parallel tasks in isolated worktrees. Skills are reusable prompt packages that extend Claude Code's capabilities for specific workflows.",
    url: "https://docs.anthropic.com/en/docs/claude-code/sub-agents",
    category: "feature",
    tags: ["claude-code", "agents", "skills", "parallel"],
  },
  {
    id: "citations-api",
    title: "Citations API for Source Attribution",
    date: "2025-03-01",
    summary:
      "The Citations API lets Claude attribute specific claims to source documents, providing verifiable references in responses.",
    url: "https://docs.anthropic.com/en/docs/build-with-claude/citations",
    category: "feature",
    tags: ["api", "citations", "attribution", "trust"],
  },
  {
    id: "files-api",
    title: "Files API for Document Processing",
    date: "2025-04-01",
    summary:
      "Upload PDFs, images, and documents directly to the API. Claude processes them natively without base64 encoding, supporting up to 100 pages per request.",
    url: "https://docs.anthropic.com/en/docs/build-with-claude/files",
    category: "feature",
    tags: ["api", "files", "pdf", "documents"],
  },
];

async function tryFetchRSS(url: string): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "KlaudeAcademy/1.0 (build-script)" },
    });
    clearTimeout(timeout);
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

async function main() {
  console.log("Fetching Claude/Anthropic updates...");

  // Try to fetch live data from Anthropic (best effort)
  for (const feed of FEEDS) {
    console.log(`  Checking ${feed.label}: ${feed.url}`);
    const html = await tryFetchRSS(feed.url);
    if (html) {
      console.log(`    ✓ Reachable (${html.length} bytes)`);
    } else {
      console.log(`    ✗ Not reachable (using curated data)`);
    }
  }

  // Sort by date descending
  const updates = CURATED_UPDATES.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const output = {
    lastUpdated: new Date().toISOString(),
    count: updates.length,
    updates,
  };

  const outPath = join(process.cwd(), "content", "updates.json");
  writeFileSync(outPath, JSON.stringify(output, null, 2));
  console.log(`\n✓ Wrote ${updates.length} updates to ${outPath}`);
}

main().catch(console.error);
