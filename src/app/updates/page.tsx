"use client";

import { useState, useMemo } from "react";
import {
  Newspaper,
  Rocket,
  Zap,
  Brain,
  Megaphone,
  BookOpen,
  ExternalLink,
  Filter,
  Calendar,
  Tag,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import updatesData from "../../../content/updates.json";

/* ── Types ──────────────────────────────────────────────────────────── */

type Category = "all" | "release" | "feature" | "model" | "announcement" | "blog";

interface UpdateEntry {
  id: string;
  title: string;
  date: string;
  summary: string;
  url: string;
  category: string;
  tags: string[];
}

/* ── Category config ────────────────────────────────────────────────── */

const CATEGORIES: { id: Category; label: string; icon: React.ReactNode }[] = [
  { id: "all", label: "All Updates", icon: <Newspaper className="h-4 w-4" /> },
  { id: "release", label: "Releases", icon: <Rocket className="h-4 w-4" /> },
  { id: "feature", label: "Features", icon: <Zap className="h-4 w-4" /> },
  { id: "model", label: "Models", icon: <Brain className="h-4 w-4" /> },
  { id: "announcement", label: "News", icon: <Megaphone className="h-4 w-4" /> },
  { id: "blog", label: "Blog", icon: <BookOpen className="h-4 w-4" /> },
];

function categoryColor(cat: string): string {
  switch (cat) {
    case "release":
      return "bg-green/10 text-green border-green/20";
    case "feature":
      return "bg-blue/10 text-blue border-blue/20";
    case "model":
      return "bg-purple/10 text-purple border-purple/20";
    case "announcement":
      return "bg-accent/10 text-accent border-accent/20";
    case "blog":
      return "bg-cyan/10 text-cyan border-cyan/20";
    default:
      return "bg-surface-2 text-muted border-border";
  }
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/* ── Page ───────────────────────────────────────────────────────────── */

export default function UpdatesPage() {
  const [activeCategory, setActiveCategory] = useState<Category>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const updates = updatesData.updates as UpdateEntry[];

  const filtered = useMemo(() => {
    return updates.filter((u) => {
      const matchesCategory =
        activeCategory === "all" || u.category === activeCategory;
      const matchesSearch =
        !searchQuery ||
        u.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.tags.some((t) =>
          t.toLowerCase().includes(searchQuery.toLowerCase())
        );
      return matchesCategory && matchesSearch;
    });
  }, [updates, activeCategory, searchQuery]);

  // Group by year
  const grouped = useMemo(() => {
    const groups: Record<string, UpdateEntry[]> = {};
    for (const entry of filtered) {
      const year = new Date(entry.date).getFullYear().toString();
      if (!groups[year]) groups[year] = [];
      groups[year].push(entry);
    }
    return Object.entries(groups).sort(
      ([a], [b]) => parseInt(b) - parseInt(a)
    );
  }, [filtered]);

  return (
    <div className="min-h-screen bg-background" data-testid="updates-page">
      {/* Header */}
      <section className="border-b border-border bg-surface py-12 sm:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-4 py-1.5 text-sm text-accent mb-6">
            <Newspaper className="h-4 w-4" />
            Claude Updates
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground font-serif italic mb-4">
            Latest Claude News & Features
          </h1>
          <p className="text-muted max-w-2xl mx-auto text-lg">
            Stay up to date with the latest Claude releases, API features, model
            updates, and Anthropic announcements. Updated at every build.
          </p>
          <p className="text-muted/60 text-sm mt-3">
            Last updated:{" "}
            {new Date(updatesData.lastUpdated).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="border-b border-border bg-surface-2/50">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            {/* Category tabs */}
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                    activeCategory === cat.id
                      ? "bg-accent text-background"
                      : "bg-surface-2 text-muted hover:text-foreground hover:bg-surface-3"
                  )}
                >
                  {cat.icon}
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-64">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
              <input
                type="text"
                placeholder="Filter updates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-surface border border-border rounded-lg text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:border-accent"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-8 sm:py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          {grouped.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted">No updates match your filter.</p>
            </div>
          ) : (
            grouped.map(([year, entries]) => (
              <div key={year} className="mb-10">
                <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-accent" />
                  {year}
                </h2>
                <div className="space-y-4">
                  {entries.map((entry) => (
                    <article
                      key={entry.id}
                      className="group border border-border rounded-xl bg-surface p-5 hover:border-border-accent transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <Badge
                              className={cn(
                                "text-xs capitalize",
                                categoryColor(entry.category)
                              )}
                            >
                              {entry.category}
                            </Badge>
                            <span className="text-xs text-muted">
                              {formatDate(entry.date)}
                            </span>
                          </div>
                          <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-accent transition-colors">
                            {entry.title}
                          </h3>
                          <p className="text-sm text-muted leading-relaxed mb-3">
                            {entry.summary}
                          </p>
                          <div className="flex flex-wrap items-center gap-2">
                            <Tag className="h-3.5 w-3.5 text-muted/50" />
                            {entry.tags.map((tag) => (
                              <span
                                key={tag}
                                className="text-xs text-muted/70 bg-surface-2 px-2 py-0.5 rounded"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                        <a
                          href={entry.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-accent hover:text-accent/80 transition-colors shrink-0"
                        >
                          Read more
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Footer note */}
      <section className="border-t border-border py-8">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center">
          <p className="text-sm text-muted">
            Updates are fetched from Anthropic&apos;s documentation and news pages at
            build time. To refresh, run{" "}
            <code className="bg-surface-2 px-1.5 py-0.5 rounded text-xs">
              npx tsx scripts/fetch-updates.ts
            </code>{" "}
            and rebuild.
          </p>
        </div>
      </section>
    </div>
  );
}
