# SQS Retry And DLQ Correctness PRD

Status: ready-for-agent

## Problem Statement

Quizito defines an SQS queue with a DLQ, but the worker catches generation errors and does not rethrow. SQS treats failed work as successful, so messages do not retry or move to DLQ. This weakens reliability and makes the async architecture misleading.

## Solution

Make worker failure handling align with SQS semantics. Retry transient failures through SQS redelivery, mark quizzes failed only after final failure, and let poisoned messages reach DLQ.

## User Stories

1. As a user, I want temporary AI/API failures retried, so that my quiz can still complete.
2. As a user, I want permanent failures reported clearly, so that I am not stuck waiting.
3. As an operator, I want failed messages in DLQ, so that I can inspect and replay them.
4. As an operator, I want quiz status to reflect processing accurately, so that support can diagnose issues.
5. As a developer, I want transient and permanent errors separated, so that retry behavior is predictable.
6. As a developer, I want idempotent persistence, so that retries do not duplicate questions.
7. As an operator, I want structured error logs with quiz id and user id, so that failures are traceable.
8. As an operator, I want max receive count to control final failure, so that retry policy lives in infrastructure.
9. As a user, I want cancelled/failed quizzes not to show as playable, so that UX stays correct.
10. As a developer, I want tests proving retry and final failure behavior, so that future changes do not break SQS semantics.

## Implementation Decisions

- Let unhandled/transient worker errors throw so SQS redelivers.
- Use SQS receive count attribute to detect final attempt.
- On non-final attempts, keep quiz status as `PROCESSING` or `PENDING_RETRY` if schema supports it.
- On final attempt, update quiz status to `FAILED` with sanitized error message, then allow DLQ movement.
- For permanent validation errors, mark quiz failed and do not retry if possible.
- Make question persistence idempotent for a quiz id. Delete existing generated questions before replacing, or use a generation attempt id.
- Do not hand-roll retry count inside message body unless needed. Prefer SQS receive metadata.
- Add structured logs for attempt count, final attempt, error category, quiz id, and user id.
- Consider partial batch response if batch size grows beyond 1 later.

## State Contract

- `PENDING`: HTTP accepted, not yet picked up.
- `PROCESSING`: worker picked up.
- `FAILED`: no more useful processing expected.
- Optional future state: `RETRYING` or `PENDING_RETRY`.
- `COMPLETED`: quiz and questions saved.

## Testing Decisions

- Unit-test error classification.
- Worker test: transient error rethrows before final attempt.
- Worker test: final attempt marks quiz failed.
- Worker test: permanent source error marks failed without duplicate persistence.
- Persistence test: retry does not duplicate questions/options.
- Infrastructure check: queue redrive policy points to DLQ with intended max receive count.

## Out Of Scope

- Admin DLQ replay UI.
- Multi-queue priority scheduling.
- User-facing retry button.
- Alerting pipeline, though logs should support it.

## Further Notes

This is the first backend reliability PRD to pick. It protects every long-running generation feature.
