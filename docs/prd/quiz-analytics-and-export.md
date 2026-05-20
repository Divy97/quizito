# Quiz Analytics And Export PRD

Status: ready-for-agent

## Problem Statement

Quizito claims detailed analytics and export capabilities, but current product appears focused on quiz creation, play, attempts, and leaderboard. Educators and trainers need downloadable quiz artifacts and useful attempt analytics.

## Solution

Add quiz owner analytics and export flows. Owners can inspect attempt performance, question-level correctness, average score/time, and export quiz questions or attempt results.

## User Stories

1. As a quiz owner, I want to see total attempts, so that I know engagement.
2. As a quiz owner, I want average score, so that I understand quiz difficulty.
3. As a quiz owner, I want average completion time, so that I know if the quiz is too long.
4. As a quiz owner, I want question-level correctness, so that I can find confusing questions.
5. As a quiz owner, I want distractor selection counts, so that I can identify misleading options.
6. As a quiz owner, I want attempt history, so that I can review participation.
7. As a quiz owner, I want CSV export of attempts, so that I can analyze offline.
8. As a quiz owner, I want CSV export of questions/answers, so that I can import elsewhere.
9. As a quiz owner, I want JSON export, so that developers can reuse quiz content.
10. As a student, I should not see owner analytics, so that privacy is protected.
11. As an anonymous quiz taker, I want my nickname handled consistently, so that exports are understandable.
12. As an operator, I want exports generated from current DB state, so that no stale files need storage.

## Implementation Decisions

- Add owner-only analytics endpoints under quiz management.
- Compute first version analytics from existing attempts, answers, questions, and options.
- If current schema does not store per-question submitted answers, add it.
- Add export endpoints for:
  - quiz questions CSV
  - quiz questions JSON
  - attempts CSV
- Enforce ownership on analytics and export endpoints.
- Keep public leaderboard separate from owner analytics.
- Add frontend analytics view from My Quizzes or quiz detail owner state.
- Use streaming or generated response for CSV, no persistent files in first version.
- Include answer key only for quiz owner exports.

## API Contract

- `GET /quizzes/:quizId/analytics`
- `GET /quizzes/:quizId/export/questions.csv`
- `GET /quizzes/:quizId/export/questions.json`
- `GET /quizzes/:quizId/export/attempts.csv`

## Data Contract

- Attempt answer records must preserve question id, selected option id, correctness, and timestamp.
- Analytics responses must avoid exposing private user ids to unauthorized users.

## Testing Decisions

- Unit-test analytics aggregation.
- API-test owner can access analytics.
- API-test non-owner cannot access analytics/private export.
- API-test CSV escaping and headers.
- UI-test analytics empty state and populated state.
- Regression-test leaderboard still works.

## Out Of Scope

- PDF export.
- LMS integrations.
- Scheduled reports.
- Cross-quiz analytics dashboard.
- Emailing exports.

## Further Notes

This feature may require schema work first if attempt answer detail is incomplete.
