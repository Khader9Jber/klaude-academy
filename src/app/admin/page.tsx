"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  UserPlus,
  BookOpen,
  Brain,
  Award,
  FileText,
  Plus,
  ArrowRight,
  Bell,
  Settings,
} from "lucide-react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

// ── Types ───────────────────────────────────────────────────────────────

interface StatCard {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  testId: string;
}

interface RecentUser {
  id: string;
  name: string;
  email: string;
  signedUpAt: string;
}

interface RecentCompletion {
  id: string;
  userName: string;
  lessonTitle: string;
  completedAt: string;
}

interface QuickAction {
  label: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  testId: string;
}

// ── Stat definitions (values filled at runtime) ─────────────────────────

const STAT_DEFS: Omit<StatCard, "value">[] = [
  { label: "Total Users", icon: Users, color: "text-blue", testId: "stat-total-users" },
  { label: "New Users (7d)", icon: UserPlus, color: "text-green", testId: "stat-new-users" },
  { label: "Lessons Completed", icon: BookOpen, color: "text-purple", testId: "stat-lessons-completed" },
  { label: "Quiz Attempts", icon: Brain, color: "text-orange", testId: "stat-quiz-attempts" },
  { label: "Certificates Issued", icon: Award, color: "text-accent", testId: "stat-certificates" },
  { label: "Published Lessons", icon: FileText, color: "text-cyan", testId: "stat-published-lessons" },
];

const QUICK_ACTIONS: QuickAction[] = [
  {
    label: "Create New Lesson",
    description: "Add a new lesson to the curriculum",
    href: "/admin/content/new",
    icon: Plus,
    testId: "quick-action-new-lesson",
  },
  {
    label: "View All Users",
    description: "Manage user accounts and roles",
    href: "/admin/users",
    icon: Users,
    testId: "quick-action-users",
  },
  {
    label: "Site Announcements",
    description: "Post updates for all learners",
    href: "/admin/announcements",
    icon: Bell,
    testId: "quick-action-announcements",
  },
  {
    label: "Site Settings",
    description: "Configure site preferences",
    href: "/admin/settings",
    icon: Settings,
    testId: "quick-action-settings",
  },
];

// ── Helpers ─────────────────────────────────────────────────────────────

function formatSlug(slug: string): string {
  return slug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

// ── Component ───────────────────────────────────────────────────────────

export default function AdminDashboardPage() {
  const supabaseConfigured = isSupabaseConfigured();
  const [stats, setStats] = useState<StatCard[]>([]);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [recentCompletions, setRecentCompletions] = useState<
    RecentCompletion[]
  >([]);
  const [dataLoaded, setDataLoaded] = useState(false);

  const dataSource: "loading" | "live" | "unconfigured" = !supabaseConfigured
    ? "unconfigured"
    : dataLoaded
      ? "live"
      : "loading";

  useEffect(() => {
    if (!supabaseConfigured) return;

    async function fetchLiveData() {
      try {
        const supabase = createClient();

        // Fetch total users count
        const { count: totalUsers } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true });

        // Fetch new users in last 7 days
        const sevenDaysAgo = new Date(
          Date.now() - 7 * 24 * 60 * 60 * 1000
        ).toISOString();
        const { count: newUsers } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true })
          .gte("created_at", sevenDaysAgo);

        // Fetch lesson completions from user_progress
        const { count: lessonsCompleted } = await supabase
          .from("user_progress")
          .select("*", { count: "exact", head: true });

        // Fetch quiz attempts
        const { count: quizAttempts } = await supabase
          .from("quiz_scores")
          .select("*", { count: "exact", head: true });

        // Fetch certificates
        const { count: certificates } = await supabase
          .from("certificates")
          .select("*", { count: "exact", head: true });

        // Published lessons count — table may not exist, default to 0
        let publishedLessons = 0;
        try {
          const { count } = await supabase
            .from("managed_content")
            .select("*", { count: "exact", head: true });
          publishedLessons = count ?? 0;
        } catch {
          // table may not exist yet
        }

        const values = [
          totalUsers ?? 0,
          newUsers ?? 0,
          lessonsCompleted ?? 0,
          quizAttempts ?? 0,
          certificates ?? 0,
          publishedLessons,
        ];

        setStats(
          STAT_DEFS.map((def, i) => ({ ...def, value: values[i] }))
        );
        setDataLoaded(true);

        // Fetch recent signups
        const { data: recentSignups } = await supabase
          .from("profiles")
          .select("id, display_name, email, created_at")
          .order("created_at", { ascending: false })
          .limit(5);

        if (recentSignups && recentSignups.length > 0) {
          setRecentUsers(
            recentSignups.map((u) => ({
              id: u.id,
              name: u.display_name ?? "Unknown",
              email: u.email ?? "",
              signedUpAt: u.created_at,
            }))
          );
        }

        // Fetch recent completions from user_progress joined with profiles
        const { data: recentCompletionData } = await supabase
          .from("user_progress")
          .select("id, user_id, lesson_slug, completed_at, profiles(display_name)")
          .order("completed_at", { ascending: false })
          .limit(5);

        if (recentCompletionData && recentCompletionData.length > 0) {
          setRecentCompletions(
            recentCompletionData.map((c) => ({
              id: c.id,
              userName:
                (c.profiles as unknown as { display_name: string })
                  ?.display_name ?? "Unknown",
              lessonTitle: formatSlug(c.lesson_slug ?? "Unknown Lesson"),
              completedAt: c.completed_at,
            }))
          );
        }
      } catch {
        // Supabase query failed — show empty state, not fake data
        setDataLoaded(true);
      }
    }

    fetchLiveData();
  }, [supabaseConfigured]);

  return (
    <div data-testid="admin-dashboard" className="space-y-8">
      {/* Page heading */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Overview</h2>
        <p className="mt-1 text-sm text-muted">
          {dataSource === "live"
            ? "Showing live data from Supabase"
            : dataSource === "unconfigured"
              ? "Supabase is not configured — connect it to see live stats"
              : "Loading..."}
        </p>
      </div>

      {dataSource === "unconfigured" && (
        <div className="rounded-xl border border-orange/30 bg-orange/10 px-5 py-4 text-sm text-orange">
          Supabase required for this feature. Set <code>NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
          <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> environment variables to enable live data.
        </div>
      )}

      {/* Stats grid */}
      <div
        data-testid="admin-stats-grid"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.testId}
              data-testid={stat.testId}
              className={cn(
                "rounded-xl border border-border bg-surface p-5",
                "transition-colors hover:border-accent/50"
              )}
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted">{stat.label}</p>
                <Icon className={cn("h-5 w-5", stat.color)} />
              </div>
              <p className="mt-2 text-3xl font-bold text-foreground">
                {stat.value.toLocaleString()}
              </p>
            </div>
          );
        })}
      </div>

      {/* Activity tables */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Recent signups */}
        <div
          data-testid="admin-recent-users"
          className="rounded-xl border border-border bg-surface"
        >
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h3 className="text-sm font-semibold text-foreground">
              Recent Signups
            </h3>
            <Link
              href="/admin/users"
              data-testid="admin-recent-users-view-all"
              className="text-xs font-medium text-accent hover:text-accent/80 transition-colors"
            >
              View all
            </Link>
          </div>
          <div className="divide-y divide-border">
            {recentUsers.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-muted">
                No users yet
              </div>
            ) : (
              recentUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between px-5 py-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {user.name}
                    </p>
                    <p className="text-xs text-muted truncate">{user.email}</p>
                  </div>
                  <span className="shrink-0 text-xs text-muted">
                    {formatRelativeTime(user.signedUpAt)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent completions */}
        <div
          data-testid="admin-recent-completions"
          className="rounded-xl border border-border bg-surface"
        >
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h3 className="text-sm font-semibold text-foreground">
              Recent Lesson Completions
            </h3>
            <Link
              href="/admin/analytics"
              data-testid="admin-recent-completions-view-all"
              className="text-xs font-medium text-accent hover:text-accent/80 transition-colors"
            >
              View all
            </Link>
          </div>
          <div className="divide-y divide-border">
            {recentCompletions.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-muted">
                No completions yet
              </div>
            ) : (
              recentCompletions.map((completion) => (
                <div
                  key={completion.id}
                  className="flex items-center justify-between px-5 py-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {completion.lessonTitle}
                    </p>
                    <p className="text-xs text-muted truncate">
                      by {completion.userName}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-muted">
                    {formatRelativeTime(completion.completedAt)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div>
        <h3 className="mb-4 text-sm font-semibold text-foreground">
          Quick Actions
        </h3>
        <div
          data-testid="admin-quick-actions"
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {QUICK_ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.testId}
                href={action.href}
                data-testid={action.testId}
                className={cn(
                  "group flex flex-col gap-3 rounded-xl border border-border bg-surface p-5",
                  "transition-colors hover:border-accent/50"
                )}
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10">
                  <Icon className="h-4 w-4 text-accent" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {action.label}
                  </p>
                  <p className="mt-0.5 text-xs text-muted">
                    {action.description}
                  </p>
                </div>
                <div className="mt-auto flex items-center gap-1 text-xs font-medium text-accent opacity-0 transition-opacity group-hover:opacity-100">
                  <span>Go</span>
                  <ArrowRight className="h-3 w-3" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
