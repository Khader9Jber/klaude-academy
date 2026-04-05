"use client";

import { useEffect, useCallback } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { createClient } from "@/lib/supabase/client";
import { useProgressStore } from "@/lib/store";

export function useSyncedProgress() {
  const { user } = useAuth();
  const store = useProgressStore();

  useEffect(() => {
    if (!user) return;

    const supabase = createClient();

    async function pullProgress() {
      const { data: lessons } = await supabase
        .from("user_progress")
        .select("lesson_slug")
        .eq("user_id", user!.id);

      if (lessons) {
        const remoteSlugs = lessons.map((l) => l.lesson_slug);
        const localSlugs = store.completedLessons;
        const merged = [...new Set([...remoteSlugs, ...localSlugs])];

        // Push any local-only progress to Supabase
        const localOnly = localSlugs.filter((s) => !remoteSlugs.includes(s));
        if (localOnly.length > 0) {
          await supabase.from("user_progress").upsert(
            localOnly.map((slug) => ({ user_id: user!.id, lesson_slug: slug })),
            { onConflict: "user_id,lesson_slug" }
          );
        }

        // Update local store with merged data
        merged.forEach((slug) => {
          if (!store.completedLessons.includes(slug)) {
            store.completeLesson(slug);
          }
        });
      }
    }

    pullProgress();
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const completeLesson = useCallback(
    async (slug: string) => {
      store.completeLesson(slug);
      if (user) {
        const supabase = createClient();
        await supabase.from("user_progress").upsert(
          { user_id: user.id, lesson_slug: slug },
          { onConflict: "user_id,lesson_slug" }
        );
        await supabase.from("activity_log").upsert(
          {
            user_id: user.id,
            activity_date: new Date().toISOString().split("T")[0],
          },
          { onConflict: "user_id,activity_date" }
        );
      }
    },
    [user, store]
  );

  const saveQuizScore = useCallback(
    async (quizId: string, score: number, total?: number) => {
      store.saveQuizScore(quizId, score);
      if (user) {
        const supabase = createClient();
        const existing = store.quizScores[quizId];
        const bestScore = existing ? Math.max(existing, score) : score;
        await supabase.from("quiz_scores").upsert(
          {
            user_id: user.id,
            quiz_id: quizId,
            score,
            total: total ?? score,
            best_score: bestScore,
          },
          { onConflict: "user_id,quiz_id" }
        );
      }
    },
    [user, store]
  );

  return { completeLesson, saveQuizScore, user };
}
