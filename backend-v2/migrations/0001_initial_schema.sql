create extension if not exists "pgcrypto";

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  google_id text not null unique,
  email text not null unique,
  username text not null,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists quizzes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  title text not null,
  description text,
  source_type text not null check (source_type in ('pdf', 'url', 'topic', 'youtube')),
  source_data text not null,
  difficulty text not null check (difficulty in ('easy', 'medium', 'hard')),
  question_count integer not null check (question_count > 0),
  ai_provider text not null default 'openrouter' check (ai_provider in ('openrouter')),
  ai_model text,
  is_public boolean not null default false,
  status text not null default 'PENDING' check (status in ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED')),
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists questions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references quizzes(id) on delete cascade,
  question text not null,
  source_quote text,
  explanation text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists question_options (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references questions(id) on delete cascade,
  option_text text not null,
  is_correct boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references quizzes(id) on delete cascade,
  user_id uuid references users(id) on delete set null,
  nickname text not null,
  score integer not null check (score >= 0 and score <= 100),
  time_taken_seconds integer not null check (time_taken_seconds > 0),
  submitted_at timestamptz not null default now()
);

create table if not exists quiz_attempt_answers (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references quiz_attempts(id) on delete cascade,
  question_id uuid not null references questions(id) on delete cascade,
  selected_option_id uuid references question_options(id) on delete set null,
  correct_option_id uuid references question_options(id) on delete set null,
  is_correct boolean not null,
  created_at timestamptz not null default now(),
  unique (attempt_id, question_id)
);

create table if not exists user_ai_provider_keys (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  provider text not null check (provider in ('openrouter')),
  status text not null default 'active' check (status in ('active', 'invalid', 'deleted')),
  encrypted_secret bytea not null,
  encrypted_data_key bytea not null,
  secret_iv bytea not null,
  secret_auth_tag bytea not null,
  key_fingerprint text not null,
  last_used_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, provider)
);

create index if not exists idx_users_google_id on users(google_id);
create index if not exists idx_quizzes_user_created_at on quizzes(user_id, created_at desc);
create index if not exists idx_quizzes_public_status on quizzes(is_public, status);
create index if not exists idx_questions_quiz_id on questions(quiz_id);
create index if not exists idx_question_options_question_id on question_options(question_id);
create index if not exists idx_quiz_attempts_quiz_score_time on quiz_attempts(quiz_id, score desc, time_taken_seconds asc);
create index if not exists idx_quiz_attempt_answers_attempt_id on quiz_attempt_answers(attempt_id);
create index if not exists idx_user_ai_provider_keys_user_status on user_ai_provider_keys(user_id, status);

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_users_updated_at on users;
create trigger set_users_updated_at
before update on users
for each row execute function set_updated_at();

drop trigger if exists set_quizzes_updated_at on quizzes;
create trigger set_quizzes_updated_at
before update on quizzes
for each row execute function set_updated_at();

drop trigger if exists set_questions_updated_at on questions;
create trigger set_questions_updated_at
before update on questions
for each row execute function set_updated_at();

drop trigger if exists set_question_options_updated_at on question_options;
create trigger set_question_options_updated_at
before update on question_options
for each row execute function set_updated_at();

drop trigger if exists set_user_ai_provider_keys_updated_at on user_ai_provider_keys;
create trigger set_user_ai_provider_keys_updated_at
before update on user_ai_provider_keys
for each row execute function set_updated_at();

create or replace function ensure_one_correct_option()
returns trigger as $$
begin
  if new.is_correct then
    update question_options
    set is_correct = false
    where question_id = new.question_id
      and id <> new.id
      and is_correct = true;
  end if;

  return new;
end;
$$ language plpgsql;

drop trigger if exists ensure_one_correct_option on question_options;
create trigger ensure_one_correct_option
after insert or update of is_correct on question_options
for each row execute function ensure_one_correct_option();
