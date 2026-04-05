"use client";

import { useEffect, useState } from "react";
import { Trophy, Medal, Award, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface LeaderboardEntry {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  lessons_completed: number;
  achievements_count: number;
  top_quiz_score: number;
}

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const supabase = createClient();
        const { data, error: fetchError } = await supabase
          .from("leaderboard")
          .select("*")
          .limit(50);

        if (fetchError) {
          // If Supabase is not configured, show empty state gracefully
          setError("Leaderboard is not available yet. Check back soon!");
          setLoading(false);
          return;
        }

        setEntries((data as LeaderboardEntry[]) ?? []);
      } catch {
        setError("Leaderboard is not available yet. Check back soon!");
      } finally {
        setLoading(false);
      }
    }

    fetchLeaderboard();
  }, []);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-accent" />;
      case 2:
        return <Medal className="h-5 w-5 text-muted" />;
      case 3:
        return <Award className="h-5 w-5 text-orange" />;
      default:
        return <span className="text-sm font-medium text-muted w-5 text-center">{rank}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="border-b border-border bg-surface/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
              <Trophy className="h-5 w-5" />
            </div>
            <Badge variant="accent">Community</Badge>
          </div>
          <h1
            data-testid="leaderboard-heading"
            className="font-serif italic text-4xl sm:text-5xl text-foreground mb-4"
          >
            Leaderboard
          </h1>
          <p className="text-lg text-muted max-w-2xl leading-relaxed">
            See how you stack up against other learners. Complete lessons, ace quizzes,
            and unlock achievements to climb the ranks.
          </p>
        </div>
      </section>

      {/* Leaderboard table */}
      <section className="py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div data-testid="leaderboard-loading" className="text-center py-16 text-muted">
              Loading leaderboard...
            </div>
          ) : error ? (
            <div
              data-testid="leaderboard-empty"
              className="text-center py-16"
            >
              <Users className="h-12 w-12 mx-auto text-muted mb-4" />
              <p className="text-muted">{error}</p>
              <p className="text-sm text-muted/60 mt-2">
                Sign up and start learning to be the first on the leaderboard!
              </p>
            </div>
          ) : entries.length === 0 ? (
            <div
              data-testid="leaderboard-empty"
              className="text-center py-16"
            >
              <Users className="h-12 w-12 mx-auto text-muted mb-4" />
              <p className="text-muted">No learners yet. Be the first!</p>
              <p className="text-sm text-muted/60 mt-2">
                Sign up and start completing lessons to appear on the leaderboard.
              </p>
            </div>
          ) : (
            <div
              data-testid="leaderboard-table"
              className="rounded-xl border border-border bg-surface overflow-hidden"
            >
              {/* Table header */}
              <div className="grid grid-cols-[3rem_1fr_6rem_6rem_6rem] gap-4 px-4 py-3 border-b border-border bg-surface-2 text-xs font-medium text-muted uppercase tracking-wider">
                <div>Rank</div>
                <div>Learner</div>
                <div className="text-center">Lessons</div>
                <div className="text-center">Badges</div>
                <div className="text-center">Top Quiz</div>
              </div>

              {/* Rows */}
              {entries.map((entry, index) => (
                <div
                  key={entry.id}
                  data-testid={`leaderboard-row-${index}`}
                  className={cn(
                    "grid grid-cols-[3rem_1fr_6rem_6rem_6rem] gap-4 px-4 py-3 items-center",
                    "border-b border-border last:border-b-0",
                    "hover:bg-surface-2/50 transition-colors",
                    index < 3 && "bg-accent/5"
                  )}
                >
                  <div className="flex items-center justify-center">
                    {getRankIcon(index + 1)}
                  </div>
                  <div className="flex items-center gap-3 min-w-0">
                    {entry.avatar_url ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={entry.avatar_url}
                        alt=""
                        className="h-8 w-8 rounded-full shrink-0 border border-border"
                      />
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-2 border border-border text-sm font-medium text-muted shrink-0">
                        {entry.display_name?.[0]?.toUpperCase() ?? "?"}
                      </div>
                    )}
                    <span className="text-sm font-medium text-foreground truncate">
                      {entry.display_name ?? "Anonymous"}
                    </span>
                  </div>
                  <div className="text-center text-sm font-medium text-foreground">
                    {entry.lessons_completed}
                  </div>
                  <div className="text-center text-sm font-medium text-foreground">
                    {entry.achievements_count}
                  </div>
                  <div className="text-center text-sm font-medium text-foreground">
                    {entry.top_quiz_score}%
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
