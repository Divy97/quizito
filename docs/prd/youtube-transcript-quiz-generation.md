# YouTube Transcript Quiz Generation PRD

Status: ready-for-agent

## Problem Statement

Quizito UI and marketing mention YouTube quizzes, but the create page shows YouTube as coming soon. Backend accepts `youtube` as a source type, yet treats it like raw text. Users cannot paste a YouTube URL and get quiz questions from the video transcript.

## Solution

Let authenticated users paste a YouTube video URL, fetch the best available transcript, normalize it into source text, and run the existing async quiz generation pipeline. The API request must stay non-blocking. Transcript failures must produce clear quiz failure messages.

## User Stories

1. As a learner, I want to paste a YouTube URL, so that I can quiz myself on a lecture.
2. As a teacher, I want to create a quiz from an educational video, so that I can assess students quickly.
3. As a creator, I want to convert my video into a shareable quiz, so that my audience can engage with the content.
4. As a user, I want private and public quiz options to work for YouTube quizzes, so that sharing behavior is consistent.
5. As a user, I want invalid YouTube URLs rejected early, so that I know what to fix.
6. As a user, I want a clear error when a video has no transcript, so that I can choose another source.
7. As a user, I want the generated quiz to cite transcript snippets, so that answers feel grounded.
8. As a user, I want long transcripts handled safely, so that generation does not time out or exceed model limits.
9. As a user, I want title, difficulty, taxonomy level, and question count to work the same as other source types.
10. As an operator, I want transcript extraction logs, so that failures can be diagnosed.
11. As an operator, I want transcript fetch to happen in the worker, so that API requests do not block.
12. As an operator, I want unsupported videos to fail the quiz record, so that pending quizzes do not hang forever.

## Implementation Decisions

- Add a YouTube transcript extraction module with a small interface: accept URL, return normalized transcript text plus video metadata when available.
- Validate YouTube URLs before enqueue. Accept common forms: watch URL, youtu.be, embed, shorts if transcript APIs support it.
- Keep transcript extraction in the quiz generation worker. The HTTP endpoint should only validate and enqueue.
- Normalize transcript text by joining captions in order, stripping timestamps and duplicate whitespace.
- Enforce max transcript characters/tokens before generation. If too long, truncate by coherent chunks or summarize before quiz generation.
- Store original URL as source data for the quiz record, and store extracted transcript internally only if current schema supports it safely. Avoid exposing giant transcript unless product wants it.
- Reuse existing generation, deduplication, refinement, persistence, status, and polling flows.
- Add UI input for YouTube tab instead of coming-soon panel.
- Show transcript-specific validation and failure messages.
- Do not add video download or audio transcription in this PRD. Transcript-only first.

## API Contract

- `POST /quizzes/generate` continues accepting `source_type: "youtube"`.
- `source_data` must be a YouTube URL.
- Status endpoint returns `FAILED` with user-readable error when transcript cannot be fetched.

## Testing Decisions

- Unit-test URL parsing for supported and unsupported URL shapes.
- Unit-test transcript normalization.
- Unit-test worker source dispatch for `youtube`.
- Integration-test enqueue then worker processing with a mocked transcript provider.
- UI-test YouTube tab validation and submit flow.
- Test external behavior only: statuses, generated request shape, error messages, and stored quiz content.

## Out Of Scope

- Downloading video/audio.
- Whisper/audio transcription.
- Playlist support.
- Multi-language transcript picker UI.
- Summarization quality tuning beyond safe length handling.

## Further Notes

This is the most visible missing source type. It should ship after retry/DLQ correctness so transcript failures do not disappear.
