-- 1. PROFILES TABLE
-- Stores public user data. This is created automatically by a trigger
-- when a new user signs up. Links to auth.users via a one-to-one relationship.
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE DEFAULT concat('user_', substr(gen_random_uuid()::text, 1, 8)),
    avatar_url TEXT,
    streak_count  integer DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comments for profiles table
COMMENT ON TABLE profiles IS 'Stores public profile information for each user.';
COMMENT ON COLUMN profiles.id IS 'References the internal Supabase auth user id.';

-- 2. QUIZZES TABLE
-- The central table for storing quiz metadata.
-- Each quiz created by a user (public or private)

CREATE TABLE quizzes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    source_type TEXT CHECK (source_type IN ('youtube', 'url', 'document', 'topic')) NOT NULL, -- e.g., 'youtube', 'url', 'document', 'topic'
    source_data TEXT NOT NULL, -- e.g., 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'https://www.google.com', 'https://www.google.com', 'https://www.google.com'
    is_public BOOLEAN DEFAULT FALSE NOT NULL,
    max_attempts    integer DEFAULT 1,
    question_count  integer NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comments for quizzes table
COMMENT ON TABLE quizzes IS 'Stores the core information about each quiz.';
COMMENT ON COLUMN quizzes.user_id IS 'The user who created the quiz.';
COMMENT ON COLUMN quizzes.source_type IS 'The type of content the quiz was generated from.';
COMMENT ON COLUMN quizzes.source_data IS 'The link or topic text for the source content.';
COMMENT ON COLUMN quizzes.is_public IS 'True if the quiz is accessible by anyone with the link.';


-- 3. QUESTIONS TABLE
-- Stores all questions related to a quiz.
CREATE TABLE questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    explanation TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE question_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    option_text TEXT NOT NULL,
    is_correct BOOLEAN DEFAULT FALSE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comments for questions table
COMMENT ON TABLE questions IS 'Stores individual questions, their options, and correct answers for a quiz.';
COMMENT ON TABLE question_options IS 'Stores the options for each question.';
COMMENT ON COLUMN question_options.is_correct IS 'True if the option is the correct answer.';

-- 4. QUIZ ATTEMPTS TABLE
-- This table powers the leaderboard for public quizzes.
CREATE TABLE quiz_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Track if a logged-in user took it
    nickname TEXT NOT NULL, -- Mandatory for leaderboard display
    score INTEGER NOT NULL,
    time_taken_seconds INTEGER NOT NULL,
    submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comments for quiz_attempts table
COMMENT ON TABLE quiz_attempts IS 'Records each attempt at a public quiz, used for leaderboards.';
COMMENT ON COLUMN quiz_attempts.user_id IS 'The user who took the quiz, if they were logged in.';
COMMENT ON COLUMN quiz_attempts.nickname IS 'The name displayed on the leaderboard.';

-- 5. QUIZ EXPORTS TABLE
-- This table stores the export URLs for quizzes.
CREATE TABLE quiz_exports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid REFERENCES quizzes(id) ON DELETE CASCADE,
  export_type text CHECK (export_type IN ('google_form', 'csv')) NOT NULL,
  export_url text,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comments for quiz_exports table
COMMENT ON TABLE quiz_exports IS 'Stores the export URLs for quizzes.';
COMMENT ON COLUMN quiz_exports.export_type IS 'The type of export (Google Form or CSV).';
COMMENT ON COLUMN quiz_exports.export_url IS 'The URL of the exported quiz.';


-- 5. SETUP PROFILES TRIGGER
-- A helper function and trigger to automatically create a user profile
-- upon new user signup.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- 6. ENABLE ROW LEVEL SECURITY (RLS)
-- This is a critical step to ensure data privacy and security.
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_exports ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_options ENABLE ROW LEVEL SECURITY;


-- 7. RLS POLICIES
-- Define the rules for who can access or modify data.

-- Profiles Policies
CREATE POLICY "Public profiles are viewable by everyone."
  ON profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile."
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile."
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- Quizzes Policies
CREATE POLICY "Users can create quizzes."
  ON quizzes FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view, update, and delete their own quizzes."
  ON quizzes FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view public quizzes."
  ON quizzes FOR SELECT USING (is_public = true);

-- Questions Policies
CREATE POLICY "Users can create questions for their own quizzes."
  ON questions FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM quizzes WHERE quizzes.id = questions.quiz_id AND quizzes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view questions for quizzes they can access."
  ON questions FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM quizzes WHERE quizzes.id = questions.quiz_id
    )
  );

-- Quiz Attempts Policies
CREATE POLICY "Anyone can create a quiz attempt for a public quiz."
  ON quiz_attempts FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM quizzes WHERE quizzes.id = quiz_attempts.quiz_id AND quizzes.is_public = true
    )
  );

CREATE POLICY "Anyone can view all attempts for a public quiz (for the leaderboard)."
  ON quiz_attempts FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM quizzes WHERE quizzes.id = quiz_attempts.quiz_id AND quizzes.is_public = true
    )
  );

CREATE POLICY "Users can export their own quizzes"
  ON quiz_exports FOR ALL USING (
    EXISTS (
      SELECT 1 FROM quizzes WHERE quizzes.id = quiz_exports.quiz_id AND quizzes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert options for their own questions."
  ON question_options FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM questions 
      JOIN quizzes ON quizzes.id = questions.quiz_id
      WHERE questions.id = question_options.question_id AND quizzes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view options for questions they can access."
  ON question_options FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM questions 
      JOIN quizzes ON quizzes.id = questions.quiz_id
      WHERE questions.id = question_options.question_id
    )
  );


CREATE INDEX idx_questions_quiz_id ON questions(quiz_id);
CREATE INDEX idx_question_options_question_id ON question_options(question_id);
CREATE INDEX idx_quiz_attempts_quiz_id ON quiz_attempts(quiz_id);
CREATE INDEX idx_quizzes_user_id ON quizzes(user_id);
