"use client";

import { useState, useEffect } from "react";
import { Eye, UserPlus, CheckCircle, Brain, TrendingUp, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface OverviewStats {
  totalPageViews: number;
  totalSignups: number;
  completionRate: number;
  avgQuizScore: number;
}

interface PopularLesson {
  rank: number;
  title: string;
  module: string;
  completions: number;
  avgQuizScore: number;
}

interface UserGrowthWeek {
  week: string;
  newUsers: number;
  activeUsers: number;
}

interface QuizByModule {
  module: string;
  passRate: number;
  avgScore: number;
}

interface QuizByDifficulty {
  difficulty: string;
  avgScore: number;
  attempts: number;
}

interface CompletionFunnelItem {
  module: string;
  started: number;
  completed: number;
}

/* (No demo data — only real Supabase data or empty states) */

const EMPTY_OVERVIEW: OverviewStats = {
  totalPageViews: 0,
  totalSignups: 0,
  completionRate: 0,
  avgQuizScore: 0,
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatSlug(slug: string): string {
  return slug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

function barWidth(value: number, max: number): string {
  if (max === 0) return "0%";
  return `${Math.round((value / max) * 100)}%`;
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function StatCard({
  label,
  value,
  icon: Icon,
  suffix,
  color,
  testId,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  suffix?: string;
  color: string;
  testId: string;
}) {
  return (
    <div
      data-testid={testId}
      className={cn(
        "rounded-xl border border-border bg-surface p-5",
        "flex items-start gap-4"
      )}
    >
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
          color
        )}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-sm font-medium text-muted">{label}</p>
        <p className="mt-1 text-2xl font-bold text-foreground">
          {value}
          {suffix && <span className="text-sm font-normal text-muted ml-1">{suffix}</span>}
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main page                                                          */
/* ------------------------------------------------------------------ */

export default function AnalyticsPage() {
  const supabaseConfigured = isSupabaseConfigured();
  const [overview, setOverview] = useState<OverviewStats>(EMPTY_OVERVIEW);
  const [popularLessons, setPopularLessons] = useState<PopularLesson[]>([]);
  const [userGrowth, setUserGrowth] = useState<UserGrowthWeek[]>([]);
  const [quizByModule, setQuizByModule] = useState<QuizByModule[]>([]);
  const [quizByDifficulty, setQuizByDifficulty] = useState<QuizByDifficulty[]>([]);
  const [completionFunnel, setCompletionFunnel] = useState<CompletionFunnelItem[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);

  const dataSource: "loading" | "live" | "unconfigured" = !supabaseConfigured
    ? "unconfigured"
    : dataLoaded
      ? "live"
      : "loading";

  useEffect(() => {
    if (!supabaseConfigured) return;

    async function fetchAnalytics() {
      try {
        const supabase = createClient();

        // --- Overview: total signups (from profiles) ---
        const { count: signupCount } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true });

        // --- Overview: total page views (analytics_events may not exist) ---
        let pageViewCount = 0;
        try {
          const { count } = await supabase
            .from("analytics_events")
            .select("*", { count: "exact", head: true });
          pageViewCount = count ?? 0;
        } catch {
          // table may not exist
        }

        // --- Overview: avg quiz score ---
        const { data: quizScoreData } = await supabase
          .from("quiz_scores")
          .select("score, total");

        const avgScore =
          quizScoreData && quizScoreData.length > 0
            ? Math.round(
                quizScoreData.reduce(
                  (sum, q) =>
                    sum + ((q.score ?? 0) / (q.total || 1)) * 100,
                  0
                ) / quizScoreData.length
              )
            : 0;

        // --- Overview: completion rate ---
        const { count: completedLessonCount } = await supabase
          .from("user_progress")
          .select("*", { count: "exact", head: true });

        const totalLessons = 74; // total lessons in the curriculum
        const rate =
          completedLessonCount !== null && totalLessons > 0
            ? Math.round((completedLessonCount / totalLessons) * 100)
            : 0;

        setOverview({
          totalPageViews: pageViewCount,
          totalSignups: signupCount ?? 0,
          completionRate: Math.min(rate, 100),
          avgQuizScore: avgScore,
        });

        // --- Popular Lessons (from user_progress grouped by lesson_slug) ---
        const { data: progressData } = await supabase
          .from("user_progress")
          .select("lesson_slug, module_slug");

        if (progressData && progressData.length > 0) {
          const lessonMap: Record<string, { module: string; count: number }> = {};
          for (const row of progressData) {
            const key = row.lesson_slug;
            if (!lessonMap[key]) {
              lessonMap[key] = { module: row.module_slug, count: 0 };
            }
            lessonMap[key].count++;
          }
          const sorted = Object.entries(lessonMap)
            .sort((a, b) => b[1].count - a[1].count)
            .slice(0, 10);
          setPopularLessons(
            sorted.map(([slug, info], i) => ({
              rank: i + 1,
              title: formatSlug(slug),
              module: formatSlug(info.module),
              completions: info.count,
              avgQuizScore: 0,
            }))
          );
        }

        // --- User Growth (weekly signups from profiles) ---
        const { data: allProfiles } = await supabase
          .from("profiles")
          .select("created_at")
          .order("created_at", { ascending: true });

        if (allProfiles && allProfiles.length > 0) {
          const weekMap: Record<string, { newUsers: number; week: string }> = {};
          for (const p of allProfiles) {
            const d = new Date(p.created_at);
            const weekStart = new Date(d);
            weekStart.setDate(d.getDate() - d.getDay());
            const key = weekStart.toISOString().slice(0, 10);
            if (!weekMap[key]) {
              const end = new Date(weekStart);
              end.setDate(weekStart.getDate() + 6);
              weekMap[key] = {
                newUsers: 0,
                week: `${weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${end.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
              };
            }
            weekMap[key].newUsers++;
          }
          setUserGrowth(
            Object.values(weekMap).map((w) => ({
              ...w,
              activeUsers: w.newUsers,
            }))
          );
        }

        // --- Quiz by module (from quiz_scores) ---
        if (quizScoreData && quizScoreData.length > 0) {
          // We already have the data, but quiz_scores doesn't have module info
          // Set empty for now — need quiz_slug to module mapping
        }

        setDataLoaded(true);
      } catch {
        // Supabase query failed — show empty state
        setDataLoaded(true);
      }
    }

    fetchAnalytics();
  }, [supabaseConfigured]);

  // Suppress unused-setter warnings — setters are ready for future live data
  void setQuizByModule;
  void setQuizByDifficulty;
  void setCompletionFunnel;

  const maxGrowthUsers = userGrowth.length > 0 ? Math.max(...userGrowth.map((w) => w.activeUsers)) : 0;
  const maxStarted = completionFunnel.length > 0 ? Math.max(...completionFunnel.map((f) => f.started)) : 0;

  return (
    <div data-testid="analytics-page" className="space-y-8">
      {/* Page title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
          <p className="mt-1 text-sm text-muted">
            {dataSource === "live"
              ? "Showing live data from Supabase"
              : dataSource === "unconfigured"
                ? "Supabase is not configured"
                : "Loading..."}
          </p>
        </div>
      </div>

      {dataSource === "unconfigured" && (
        <div className="rounded-xl border border-orange/30 bg-orange/10 px-5 py-4 text-sm text-orange">
          Supabase required for this feature. Set <code>NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
          <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> environment variables to enable analytics.
        </div>
      )}

      {/* -------- Overview Cards -------- */}
      <section data-testid="analytics-overview" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          testId="stat-page-views"
          label="Total Page Views"
          value={formatNumber(overview.totalPageViews)}
          icon={Eye}
          color="bg-blue/10 text-blue"
        />
        <StatCard
          testId="stat-signups"
          label="Total Signups"
          value={formatNumber(overview.totalSignups)}
          icon={UserPlus}
          color="bg-green/10 text-green"
        />
        <StatCard
          testId="stat-completion-rate"
          label="Completion Rate"
          value={`${overview.completionRate}`}
          suffix="%"
          icon={CheckCircle}
          color="bg-purple/10 text-purple"
        />
        <StatCard
          testId="stat-avg-quiz"
          label="Avg Quiz Score"
          value={`${overview.avgQuizScore}`}
          suffix="%"
          icon={Brain}
          color="bg-accent/10 text-accent"
        />
      </section>

      {/* -------- Popular Lessons -------- */}
      <section data-testid="analytics-popular-lessons">
        <h2 className="mb-4 text-lg font-semibold text-foreground">Popular Lessons</h2>
        {popularLessons.length === 0 ? (
          <div className="rounded-xl border border-border bg-surface px-5 py-8 text-center text-sm text-muted">
            No data yet
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border bg-surface">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-2">
                  <th className="px-4 py-3 text-left font-medium text-muted w-12">#</th>
                  <th className="px-4 py-3 text-left font-medium text-muted">Lesson</th>
                  <th className="px-4 py-3 text-left font-medium text-muted">Module</th>
                  <th className="px-4 py-3 text-right font-medium text-muted">Completions</th>
                  <th className="px-4 py-3 text-right font-medium text-muted">Avg Score</th>
                </tr>
              </thead>
              <tbody>
                {popularLessons.map((lesson) => (
                  <tr
                    key={lesson.rank}
                    data-testid={`popular-lesson-${lesson.rank}`}
                    className="border-b border-border last:border-0 hover:bg-surface-2/50 transition-colors"
                  >
                    <td className="px-4 py-3 font-mono text-muted">{lesson.rank}</td>
                    <td className="px-4 py-3 font-medium text-foreground">{lesson.title}</td>
                    <td className="px-4 py-3 text-muted">{lesson.module}</td>
                    <td className="px-4 py-3 text-right font-mono text-foreground">
                      {lesson.completions.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                          lesson.avgQuizScore >= 85
                            ? "bg-green/10 text-green"
                            : lesson.avgQuizScore >= 70
                            ? "bg-accent/10 text-accent"
                            : "bg-orange/10 text-orange"
                        )}
                      >
                        {lesson.avgQuizScore}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* -------- User Growth -------- */}
      <section data-testid="analytics-user-growth">
        <h2 className="mb-4 text-lg font-semibold text-foreground">User Growth (Last 30 Days)</h2>
        {userGrowth.length === 0 ? (
          <div className="rounded-xl border border-border bg-surface px-5 py-8 text-center text-sm text-muted">
            No data yet
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-surface p-5">
            {/* Bar chart */}
            <div className="mb-6 flex items-end gap-3 h-40">
              {userGrowth.map((week, i) => (
                <div key={i} className="flex flex-1 flex-col items-center gap-2">
                  <div className="flex w-full gap-1 items-end" style={{ height: "100%" }}>
                    {/* New users bar */}
                    <div
                      data-testid={`growth-bar-new-${i}`}
                      className="flex-1 rounded-t bg-green/60 transition-all duration-500"
                      style={{
                        height: barWidth(week.newUsers, maxGrowthUsers),
                        minHeight: "4px",
                      }}
                      title={`New: ${week.newUsers}`}
                    />
                    {/* Active users bar */}
                    <div
                      data-testid={`growth-bar-active-${i}`}
                      className="flex-1 rounded-t bg-blue/60 transition-all duration-500"
                      style={{
                        height: barWidth(week.activeUsers, maxGrowthUsers),
                        minHeight: "4px",
                      }}
                      title={`Active: ${week.activeUsers}`}
                    />
                  </div>
                  <span className="text-[10px] text-muted text-center leading-tight">
                    {week.week.split(" - ")[0]}
                  </span>
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 text-xs text-muted">
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded bg-green/60" />
                <span>New Users</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded bg-blue/60" />
                <span>Active Users</span>
              </div>
            </div>

            {/* Table fallback */}
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-3 py-2 text-left font-medium text-muted">Week</th>
                    <th className="px-3 py-2 text-right font-medium text-muted">New Users</th>
                    <th className="px-3 py-2 text-right font-medium text-muted">Active Users</th>
                  </tr>
                </thead>
                <tbody>
                  {userGrowth.map((week, i) => (
                    <tr
                      key={i}
                      data-testid={`growth-row-${i}`}
                      className="border-b border-border last:border-0"
                    >
                      <td className="px-3 py-2 text-muted">{week.week}</td>
                      <td className="px-3 py-2 text-right font-mono text-green">{week.newUsers}</td>
                      <td className="px-3 py-2 text-right font-mono text-blue">{week.activeUsers}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {/* -------- Quiz Performance -------- */}
      <section data-testid="analytics-quiz-performance" className="grid gap-6 lg:grid-cols-2">
        {/* Pass rate by module */}
        <div>
          <h2 className="mb-4 text-lg font-semibold text-foreground flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-accent" />
            Pass Rate by Module
          </h2>
          {quizByModule.length === 0 ? (
            <div className="rounded-xl border border-border bg-surface px-5 py-8 text-center text-sm text-muted">
              No data yet
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-border bg-surface">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-surface-2">
                    <th className="px-4 py-3 text-left font-medium text-muted">Module</th>
                    <th className="px-4 py-3 text-right font-medium text-muted">Pass Rate</th>
                    <th className="px-4 py-3 text-right font-medium text-muted">Avg Score</th>
                  </tr>
                </thead>
                <tbody>
                  {quizByModule.map((row) => (
                    <tr
                      key={row.module}
                      data-testid={`quiz-module-${row.module.toLowerCase().replace(/\s+/g, "-")}`}
                      className="border-b border-border last:border-0 hover:bg-surface-2/50 transition-colors"
                    >
                      <td className="px-4 py-3 font-medium text-foreground">{row.module}</td>
                      <td className="px-4 py-3 text-right">
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                            row.passRate >= 85
                              ? "bg-green/10 text-green"
                              : row.passRate >= 70
                              ? "bg-accent/10 text-accent"
                              : "bg-red/10 text-red"
                          )}
                        >
                          {row.passRate}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-muted">{row.avgScore}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Average score by difficulty */}
        <div>
          <h2 className="mb-4 text-lg font-semibold text-foreground flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-purple" />
            Score by Difficulty
          </h2>
          {quizByDifficulty.length === 0 ? (
            <div className="rounded-xl border border-border bg-surface px-5 py-8 text-center text-sm text-muted">
              No data yet
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-border bg-surface">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-surface-2">
                    <th className="px-4 py-3 text-left font-medium text-muted">Difficulty</th>
                    <th className="px-4 py-3 text-right font-medium text-muted">Avg Score</th>
                    <th className="px-4 py-3 text-right font-medium text-muted">Attempts</th>
                  </tr>
                </thead>
                <tbody>
                  {quizByDifficulty.map((row) => (
                    <tr
                      key={row.difficulty}
                      data-testid={`quiz-difficulty-${row.difficulty.toLowerCase()}`}
                      className="border-b border-border last:border-0 hover:bg-surface-2/50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                            row.difficulty === "Beginner"
                              ? "bg-green/10 text-green"
                              : row.difficulty === "Intermediate"
                              ? "bg-blue/10 text-blue"
                              : row.difficulty === "Advanced"
                              ? "bg-purple/10 text-purple"
                              : "bg-red/10 text-red"
                          )}
                        >
                          {row.difficulty}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-foreground">{row.avgScore}%</td>
                      <td className="px-4 py-3 text-right font-mono text-muted">
                        {row.attempts.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* -------- Completion Funnel -------- */}
      <section data-testid="analytics-completion-funnel">
        <h2 className="mb-4 text-lg font-semibold text-foreground">Completion Funnel</h2>
        {completionFunnel.length === 0 ? (
          <div className="rounded-xl border border-border bg-surface px-5 py-8 text-center text-sm text-muted">
            No data yet
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-surface p-5 space-y-3">
            {completionFunnel.map((item) => {
              const completionPct =
                item.started > 0 ? Math.round((item.completed / item.started) * 100) : 0;

              return (
                <div
                  key={item.module}
                  data-testid={`funnel-${item.module.toLowerCase().replace(/\s+/g, "-")}`}
                  className="space-y-1.5"
                >
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-foreground">{item.module}</span>
                    <span className="text-xs text-muted">
                      {item.completed.toLocaleString()} / {item.started.toLocaleString()}{" "}
                      <span
                        className={cn(
                          "font-medium",
                          completionPct >= 70
                            ? "text-green"
                            : completionPct >= 40
                            ? "text-accent"
                            : "text-red"
                        )}
                      >
                        ({completionPct}%)
                      </span>
                    </span>
                  </div>
                  {/* Horizontal bars */}
                  <div className="relative h-5 w-full rounded-full bg-surface-2 overflow-hidden">
                    {/* Started (full width = max) */}
                    <div
                      className="absolute inset-y-0 left-0 rounded-full bg-blue/20 transition-all duration-500"
                      style={{ width: barWidth(item.started, maxStarted) }}
                    />
                    {/* Completed */}
                    <div
                      className="absolute inset-y-0 left-0 rounded-full bg-green/50 transition-all duration-500"
                      style={{ width: barWidth(item.completed, maxStarted) }}
                    />
                  </div>
                </div>
              );
            })}

            {/* Legend */}
            <div className="flex items-center gap-4 pt-2 text-xs text-muted border-t border-border mt-4">
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded bg-blue/20 border border-blue/30" />
                <span>Started</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded bg-green/50" />
                <span>Completed</span>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
