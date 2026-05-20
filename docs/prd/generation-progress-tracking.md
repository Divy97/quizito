# Generation Progress Tracking PRD

Status: ready-for-agent

## Problem Statement

Quizito has async generation but only exposes coarse status. Users wait without knowing whether the quiz is queued, extracting content, generating questions, deduplicating, refining, or saving.

## Solution

Track generation stages and progress metadata on the quiz record or related progress table. Update progress from the worker after each major stage. Show meaningful progress in the create page while polling.

## User Stories

1. As a user, I want to see that my quiz is queued, so that I know submit worked.
2. As a user, I want to see content extraction progress, so that PDF/URL/YouTube sources feel alive.
3. As a user, I want to see AI generation progress, so that long waits are understandable.
4. As a user, I want to see failure stage and message, so that I know what went wrong.
5. As a user, I want the app to navigate automatically when complete, so that current flow remains smooth.
6. As an operator, I want timestamps for each stage, so that slow stages can be diagnosed.
7. As a developer, I want progress updates isolated behind one service, so that worker code stays clean.
8. As a developer, I want progress to work for all source types, so that features share UX.
9. As a user, I want refresh-safe progress, so that I can reload and continue waiting.
10. As an operator, I want no fake precise progress, so that UI does not lie.

## Implementation Decisions

- Add generation progress fields to the quiz record or a dedicated `quiz_generation_events` table.
- Use named stages, not only percent:
  - queued
  - extracting_source
  - generating_questions
  - deduplicating_questions
  - refining_questions
  - saving_quiz
  - completed
  - failed
- Percent can be approximate and derived from stage weights.
- Update status endpoint to include stage, progress percent, current message, started time, updated time, and error message.
- Add a progress service used by API and worker.
- Frontend polling keeps existing 5-second cadence but renders stage text and progress bar.
- If progress fields are missing for old quizzes, fallback to current status behavior.
- Do not add WebSockets/SSE in first version.

## API Contract

- `GET /quizzes/:quizId/status` returns:
  - `status`
  - `stage`
  - `progress`
  - `message`
  - `errorMessage`
  - `updatedAt`
- Existing clients using `status` continue working.

## Testing Decisions

- Unit-test stage-to-progress mapping.
- Unit-test progress service updates.
- Worker test: expected stages are emitted in order on happy path.
- Worker test: failure records failed stage and message.
- UI test: progress renders and completion redirects.
- API test: old status clients still receive status.

## Out Of Scope

- Real-time push via WebSocket/SSE.
- Per-question streaming.
- Detailed token usage display.
- User notifications outside the current page.

## Further Notes

This should follow retry correctness and DB migrations. It improves trust without changing generation quality.
