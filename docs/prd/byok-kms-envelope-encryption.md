# BYOK With KMS Envelope Encryption PRD

Status: ready-for-agent

## Problem Statement

Quizito uses app-level AI provider keys from environment variables. The claimed BYOK feature is not built: users cannot add their own AI API keys, choose providers, or have keys encrypted with AWS KMS envelope encryption.

## Solution

Let users securely save, test, use, rotate, and delete their own AI provider keys. Store encrypted keys only. Decrypt only inside backend execution when needed for quiz generation. Prefer user keys when configured, otherwise fall back to platform keys if allowed.

## User Stories

1. As a power user, I want to bring my own AI API key, so that I control provider billing.
2. As a privacy-conscious user, I want my key encrypted at rest, so that a database leak does not expose it.
3. As a user, I want to test a key before saving, so that I know it works.
4. As a user, I want to delete my key, so that Quizito can no longer use it.
5. As a user, I want to rotate my key, so that I can follow my security process.
6. As a user, I want to see provider and last-used metadata, not the secret, so that I can manage keys safely.
7. As a user, I want Quizito to use my key for generation when enabled, so that platform quota is not used.
8. As an operator, I want KMS encryption boundaries, so that plaintext keys do not persist in logs or DB.
9. As an operator, I want provider validation isolated, so that new providers can be added later.
10. As an operator, I want clear audit metadata, so that key usage can be debugged without revealing secrets.
11. As an operator, I want failure fallback behavior explicit, so that BYOK failures do not silently bill platform keys.
12. As a developer, I want a small key repository module, so that encryption concerns stay testable.

## Implementation Decisions

- Add an AI key management domain module with these responsibilities: validate provider, encrypt for storage, decrypt for use, mask metadata for responses.
- Use AWS KMS for envelope encryption. Store encrypted data key, encrypted secret, provider, user id, status, created time, updated time, last used time, and key fingerprint.
- Add KMS IAM permissions only to functions that must encrypt/decrypt.
- Never log plaintext key, decrypted key, or authorization headers.
- Add authenticated endpoints for list, create/update, test, delete.
- The quiz generation worker resolves provider credentials per user before calling LLM/embedding services.
- Add explicit BYOK policy: if user key exists but fails, mark generation failed with actionable message. Do not silently fall back unless user enabled fallback.
- Keep platform env keys as default path for users without BYOK.
- Design provider abstraction now for Anthropic and Google, but keep UI minimal.
- Add frontend settings page or account section for key management.

## API Contract

- `GET /ai-keys` returns provider metadata and masked status.
- `PUT /ai-keys/:provider` saves or rotates a key.
- `POST /ai-keys/:provider/test` validates a key without saving or validates saved key.
- `DELETE /ai-keys/:provider` removes saved key.
- Generation API does not accept raw keys.

## Data Contract

- Store ciphertext only for user secrets.
- Store a non-secret fingerprint for display and rotation detection.
- Store key status values: active, invalid, deleted.

## Testing Decisions

- Unit-test envelope encryption wrapper with mocked KMS.
- Unit-test key masking and no-secret response shape.
- Unit-test generation credential resolution.
- Integration-test create/list/delete lifecycle with mocked KMS.
- Worker test: user key selected when active, platform key selected when absent.
- Failure test: invalid saved key marks quiz failed, no fallback unless enabled.

## Out Of Scope

- Team/shared keys.
- Per-quiz provider selection.
- Billing dashboards for BYOK spend.
- OAuth-based provider connection.
- Importing keys from browser extensions or secrets managers.

## Further Notes

This feature touches security-sensitive code. Implement after DB migrations exist and before claiming BYOK publicly.
