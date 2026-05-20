# Database Schema And Migrations PRD

Status: ready-for-agent

## Problem Statement

Backend code assumes database tables exist, but the Quizito repo does not show migrations/schema for core tables. This makes local setup, deployment, review, and agent work fragile.

## Solution

Add versioned database migrations and schema documentation for Quizito core data. Migrations should create and evolve tables required by auth, quizzes, questions, options, attempts, answers, generation progress, BYOK, and future analytics.

## User Stories

1. As a developer, I want to run migrations locally, so that I can start the app from an empty database.
2. As an agent, I want schema files in repo, so that I can safely change persistence code.
3. As an operator, I want repeatable migrations, so that deploys are reliable.
4. As a developer, I want constraints and indexes, so that app bugs are caught early.
5. As a developer, I want status enums documented, so that worker and UI agree.
6. As a user, I want quiz creation to persist consistently, so that quizzes do not disappear.
7. As a quiz owner, I want attempts and answers stored correctly, so that analytics can work.
8. As a security reviewer, I want BYOK secret storage schema explicit, so that encryption can be audited.
9. As a developer, I want seed/test data options, so that local QA is faster.
10. As an operator, I want rollback or forward-fix strategy documented, so that production changes are safer.

## Implementation Decisions

- Choose one migration tool for the backend. Keep it simple and compatible with Supabase/Postgres.
- Add migrations for existing required tables:
  - users
  - quizzes
  - questions
  - question_options
  - quiz_attempts
  - quiz_attempt_answers if missing
- Add future-ready tables/columns for:
  - quiz generation progress
  - user AI provider keys
  - generation attempt id if needed for idempotency
- Add indexes for user quiz lists, public quiz lookup, quiz questions, attempt lookup, and leaderboard queries.
- Add constraints for source type, difficulty, status, option correctness, and ownership.
- Add updated-at triggers or application-owned updated-at pattern, but document one choice.
- Add setup docs for applying migrations locally and in deploy.
- Keep generated SQL readable and reviewed.

## Schema Decisions

- Quizzes need status values at least: pending, processing, completed, failed.
- Questions should store source quote if product wants grounded answers visible or auditable.
- Attempts should store nickname, score, time taken, submitted time.
- Attempt answers should store selected option id and correctness snapshot.
- User AI keys must store ciphertext and metadata only, never plaintext.

## Testing Decisions

- Migration test against empty Postgres/Supabase-compatible DB.
- Persistence service tests using migrated schema.
- Constraint tests for invalid source type/status.
- Idempotency test for retrying generation on same quiz id.
- Query tests for my quizzes, public quiz, leaderboard, analytics base data.

## Out Of Scope

- Data backfill from production unless current production schema is shared.
- Switching database provider.
- ORM adoption unless chosen explicitly.
- Full seed catalog beyond minimal local fixture.

## Further Notes

This is foundational. Do this before BYOK, progress tracking, analytics, or retry idempotency changes.
