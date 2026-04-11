-- ============================================
-- Klaude Academy — Initial Database Schema
-- ============================================

-- User profiles (extends auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User progress
CREATE TABLE public.user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_slug TEXT NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, lesson_slug)
);

-- Quiz scores
CREATE TABLE public.quiz_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quiz_id TEXT NOT NULL,
  score INTEGER NOT NULL,
  total INTEGER NOT NULL,
  best_score INTEGER NOT NULL,
  attempted_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, quiz_id)
);

-- Exercise completions
CREATE TABLE public.exercise_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_id TEXT NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, exercise_id)
);

-- Activity log (for streaks)
CREATE TABLE public.activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_date DATE NOT NULL DEFAULT CURRENT_DATE,
  UNIQUE(user_id, activity_date)
);

-- Achievements
CREATE TABLE public.user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- Certificates
CREATE TABLE public.certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  certificate_type TEXT NOT NULL, -- 'foundation', 'practitioner', 'power-user', 'expert', 'full'
  issued_at TIMESTAMPTZ DEFAULT NOW(),
  certificate_number TEXT UNIQUE DEFAULT 'CA-' || EXTRACT(EPOCH FROM NOW())::TEXT
);

-- ============================================
-- Row Level Security
-- ============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS Policies
-- ============================================

-- Profiles
CREATE POLICY "Users read own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Progress
CREATE POLICY "Users read own progress" ON public.user_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own progress" ON public.user_progress FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Quiz scores
CREATE POLICY "Users read own quiz scores" ON public.quiz_scores FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users upsert own quiz scores" ON public.quiz_scores FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own quiz scores" ON public.quiz_scores FOR UPDATE USING (auth.uid() = user_id);

-- Exercises
CREATE POLICY "Users read own exercises" ON public.exercise_completions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own exercises" ON public.exercise_completions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Activity log
CREATE POLICY "Users read own activity" ON public.activity_log FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own activity" ON public.activity_log FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Achievements
CREATE POLICY "Users read own achievements" ON public.user_achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own achievements" ON public.user_achievements FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Certificates
CREATE POLICY "Users read own certificates" ON public.certificates FOR SELECT USING (auth.uid() = user_id);

-- ============================================
-- Leaderboard view (public read, no auth required)
-- ============================================

CREATE VIEW public.leaderboard AS
SELECT
  p.id,
  p.display_name,
  p.avatar_url,
  COUNT(DISTINCT up.lesson_slug) as lessons_completed,
  COUNT(DISTINCT ua.achievement_id) as achievements_count,
  COALESCE(MAX(qs.best_score), 0) as top_quiz_score
FROM public.profiles p
LEFT JOIN public.user_progress up ON p.id = up.user_id
LEFT JOIN public.user_achievements ua ON p.id = ua.user_id
LEFT JOIN public.quiz_scores qs ON p.id = qs.user_id
GROUP BY p.id, p.display_name, p.avatar_url
ORDER BY lessons_completed DESC, achievements_count DESC;

-- ============================================
-- Auto-create profile on signup
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
