# Quizito PRDs

Status: ready-for-agent

This folder tracks missing product/backend capabilities that are claimed or implied but not fully built yet.

## Pick Order

1. [SQS Retry And DLQ Correctness](./sqs-retry-dlq-correctness.md)
2. [Database Schema And Migrations](./database-schema-and-migrations.md)
3. [Generation Progress Tracking](./generation-progress-tracking.md)
4. [YouTube Transcript Quiz Generation](./youtube-transcript-quiz-generation.md)
5. [Redis Rate Limiting](./redis-rate-limiting.md)
6. [BYOK With KMS Envelope Encryption](./byok-kms-envelope-encryption.md)
7. [Quiz Analytics And Export](./quiz-analytics-and-export.md)

## Notes

- PRDs use current repo language: quiz, generation request, quiz generation worker, source data, attempt, leaderboard.
- Each PRD is scoped to one independently shippable feature.
- Each PRD includes tests expected before merge.
