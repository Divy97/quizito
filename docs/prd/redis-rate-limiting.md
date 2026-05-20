# Redis Rate Limiting PRD

Status: ready-for-agent

## Problem Statement

The README claims rate limiting, but there is no Redis-backed limiter. Quiz generation is expensive and can be spammed by authenticated users, causing AI cost spikes, queue overload, and poor service quality.

## Solution

Add a Redis-backed rate limiter for expensive and abuse-prone endpoints. Limit by authenticated user id where available and by IP for unauthenticated/public endpoints. Return clear 429 responses with retry metadata.

## User Stories

1. As an operator, I want quiz generation throttled, so that AI spend stays controlled.
2. As a user, I want clear rate-limit errors, so that I know when to retry.
3. As an operator, I want limits per endpoint class, so that cheap reads and expensive generation are treated differently.
4. As an operator, I want limits by user id, so that one user cannot starve others.
5. As an operator, I want IP fallback limits, so that unauthenticated routes are protected.
6. As a developer, I want limiter config centralized, so that limits are easy to tune.
7. As a developer, I want limiter behavior testable without real Redis, so that CI stays stable.
8. As an operator, I want Redis failures handled safely, so that downtime mode is explicit.
9. As a user, I want normal quiz viewing unaffected by generation limits, so that reading remains smooth.
10. As an operator, I want metrics/logs for limited requests, so that abuse can be spotted.

## Implementation Decisions

- Use Redis or Redis-compatible hosted service for distributed Lambda-safe counters.
- Add a reusable rate-limit middleware with endpoint policy config.
- Policies:
  - quiz generation: strict per user per time window.
  - PDF upload: moderate per user and size already enforced.
  - auth/session reads: lenient.
  - public quiz/leaderboard reads: IP-based burst control.
- Return HTTP 429 with `retryAfterSeconds`, `limit`, and `windowSeconds`.
- Use atomic Redis operations for increment/expire or a library that guarantees atomic behavior.
- Prefer fail-closed for generation if Redis is unreachable, fail-open for low-cost reads if product accepts it.
- Add Serverless environment variables for Redis URL and limiter toggles.
- Avoid storing PII in Redis keys. Hash IPs if persisted beyond short TTL.

## API Contract

- Limited requests return:
  - status `429`
  - body error `Rate limit exceeded`
  - structured retry metadata
- Successful responses unchanged.

## Testing Decisions

- Unit-test limiter key generation.
- Unit-test window behavior with fake Redis.
- Integration-test generation endpoint returns 429 after configured limit.
- Test authenticated user limit and IP fallback.
- Test Redis error mode for generation.

## Out Of Scope

- Paid-plan quotas.
- CAPTCHA.
- Abuse admin dashboard.
- Long-term usage analytics.
- Web application firewall config.

## Further Notes

This should be built before opening public generation at scale.
