"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Calendar,
  BookOpen,
  Trophy,
  Flame,
  Save,
  CheckCircle,
} from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { createClient } from "@/lib/supabase/client";
import { useProgressStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { User as SupabaseUser } from "@supabase/supabase-js";

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted">Loading...</div>
      </div>
    );
  }

  // Key on user.id to re-mount with correct initial state when user changes
  return <ProfileContent key={user.id} user={user} />;
}

function ProfileContent({ user }: { user: SupabaseUser }) {
  const store = useProgressStore();
  const initialName = user.user_metadata?.full_name ?? user.user_metadata?.name ?? "";
  const [displayName, setDisplayName] = useState(initialName);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSaveDisplayName = async () => {
    setSaving(true);
    setSaved(false);

    const supabase = createClient();
    await supabase
      .from("profiles")
      .update({ display_name: displayName, updated_at: new Date().toISOString() })
      .eq("id", user.id);

    // Also update auth user metadata
    await supabase.auth.updateUser({
      data: { full_name: displayName },
    });

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const avatarUrl =
    user.user_metadata?.avatar_url ?? user.user_metadata?.picture;
  const userInitial =
    displayName?.[0] ?? user.email?.[0]?.toUpperCase() ?? "U";
  const joinDate = new Date(user.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const totalCompleted = store.completedLessons.length;
  const quizCount = Object.keys(store.quizScores).length;
  const quizAverage =
    quizCount > 0
      ? Math.round(
          Object.values(store.quizScores).reduce((sum, s) => sum + s, 0) /
            quizCount
        )
      : 0;
  const achievementsUnlocked = store.achievements.filter(
    (a) => a.unlocked
  ).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="border-b border-border bg-surface/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
              <User className="h-5 w-5" />
            </div>
            <Badge variant="accent">Account</Badge>
          </div>
          <h1
            data-testid="profile-heading"
            className="font-serif italic text-4xl sm:text-5xl text-foreground mb-4"
          >
            Your Profile
          </h1>
          <p className="text-lg text-muted max-w-2xl leading-relaxed">
            Manage your account and view your learning stats.
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Profile card */}
          <div
            data-testid="profile-card"
            className="rounded-xl border border-border bg-surface p-6"
          >
            <div className="flex items-start gap-6">
              {/* Avatar */}
              <div className="shrink-0">
                {avatarUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={avatarUrl}
                    alt=""
                    data-testid="profile-avatar"
                    className="h-20 w-20 rounded-full border-2 border-border"
                  />
                ) : (
                  <div
                    data-testid="profile-avatar-placeholder"
                    className="flex h-20 w-20 items-center justify-center rounded-full bg-accent/10 border-2 border-accent/30 text-accent text-2xl font-bold"
                  >
                    {userInitial}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0 space-y-4">
                {/* Display name edit */}
                <div>
                  <label
                    htmlFor="displayName"
                    className="block text-sm font-medium text-foreground mb-1.5"
                  >
                    Display Name
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="displayName"
                      data-testid="profile-display-name"
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className={cn(
                        "flex-1 rounded-lg border border-border bg-surface-2 px-4 py-2",
                        "text-sm text-foreground placeholder:text-muted/60",
                        "focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent",
                        "transition-colors"
                      )}
                    />
                    <Button
                      data-testid="profile-save-btn"
                      onClick={handleSaveDisplayName}
                      disabled={saving}
                      size="sm"
                    >
                      {saved ? (
                        <>
                          <CheckCircle className="h-4 w-4" />
                          Saved
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          {saving ? "Saving..." : "Save"}
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-center gap-2 text-sm text-muted">
                  <Mail className="h-4 w-4" />
                  <span data-testid="profile-email">{user.email}</span>
                </div>

                {/* Join date */}
                <div className="flex items-center gap-2 text-sm text-muted">
                  <Calendar className="h-4 w-4" />
                  <span data-testid="profile-join-date">Joined {joinDate}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div
              data-testid="profile-stat-lessons"
              className="rounded-xl border border-border bg-surface p-4 text-center"
            >
              <BookOpen className="h-5 w-5 mx-auto mb-1 text-blue" />
              <div className="text-2xl font-bold text-foreground">
                {totalCompleted}
              </div>
              <div className="text-xs text-muted">Lessons Done</div>
            </div>
            <div
              data-testid="profile-stat-quiz"
              className="rounded-xl border border-border bg-surface p-4 text-center"
            >
              <Trophy className="h-5 w-5 mx-auto mb-1 text-accent" />
              <div className="text-2xl font-bold text-foreground">
                {quizAverage > 0 ? `${quizAverage}%` : "--"}
              </div>
              <div className="text-xs text-muted">Quiz Avg</div>
            </div>
            <div
              data-testid="profile-stat-streak"
              className="rounded-xl border border-border bg-surface p-4 text-center"
            >
              <Flame className="h-5 w-5 mx-auto mb-1 text-orange" />
              <div className="text-2xl font-bold text-foreground">
                {store.streak}
              </div>
              <div className="text-xs text-muted">Day Streak</div>
            </div>
            <div
              data-testid="profile-stat-achievements"
              className="rounded-xl border border-border bg-surface p-4 text-center"
            >
              <Trophy className="h-5 w-5 mx-auto mb-1 text-purple" />
              <div className="text-2xl font-bold text-foreground">
                {achievementsUnlocked}
              </div>
              <div className="text-xs text-muted">Achievements</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
