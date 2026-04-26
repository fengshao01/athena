# Athena — an AI study companion (v2 plan)

## What it is
A web app that turns notes into flashcards and lets me chat with the content
of a single note. I paste in a lecture transcript, textbook chapter, or
Wikipedia article; Athena generates flashcards from it and answers questions
grounded in that note's text.

## Who it's for
Me — a college student who wants to internalize material faster and review
without re-reading the source.

## v1 goals (what "done" looks like)
- Create a note (title + body, plain text); see it in a list at `/notes`.
- "Generate flashcards" on a note produces 8 Q/A cards, saved to the DB.
  Re-running replaces the prior set for that note.
- Quiz page: cards listed as click-to-reveal (front visible, click shows back).
  No session, no scoring, no advance/back.
- Single-shot chat with a note: ask one question, get one answer. The note's
  full body is passed as context — no RAG, no chunking, no retrieval.
- Refusal behavior: when the note doesn't contain the answer, Athena says so.
  Verified by a 6–8 question eval set checked into the repo and run before
  each prompt change.
- Deployed at a public URL, gated (basic auth or obscure path) so it isn't
  an open LLM proxy on my API key.

## Non-goals for v1 (explicitly NOT building)
- Multi-user accounts.
- Spaced-repetition scheduling and rating storage.
- Cross-note retrieval / RAG.
- File uploads (PDF, audio).
- **Note editing after creation.** Wrong note? Delete and re-paste.
- **Per-card edit / delete.** Bad card? Regenerate the whole set.
- **Persisted chat history.** Single-shot Q&A only.
- Mobile-first UI.

## Data shapes
- `Note      { id, title, body, createdAt }`
- `Flashcard { id, noteId, front, back, createdAt }`

That is the entire schema. No `updatedAt` on Note (notes are immutable). No
`Review` table (nothing in v1 reads ratings; v2's SRS will pick its own
schema once the algorithm is chosen). No `ChatMessage` table (single-shot
chat is a function call, not a subsystem).

## The Day 7 demo
1. Visit the live URL, authenticate.
2. Paste a Wikipedia article on a topic I'm learning.
3. Click "Generate flashcards" — 8 cards appear.
4. Open the quiz — click each card to reveal the back.
5. Open chat — ask "what's the key takeaway?" — get a grounded answer.
6. Ask one deliberately off-topic question — Athena refuses.

## The riskiest assumption
That chat reliably refuses when the answer isn't in the note. LLMs default
to confident extrapolation, especially when a question is *almost* answered
by the source. Single-prompt refusal is the demo-killer: one hallucinated
answer and the room sees it.

**Mitigation:** a 6–8 question eval set committed to the repo — mix of
in-source, partially-in-source, and out-of-source questions — run before
every prompt change. Half-day budget reserved on Day 5 or 6. If single-prompt
refusal is unreliable, fall back to a two-step prompt (answerability check
first, then answer).

Flashcard quality is *not* the riskiest assumption. I'm the user; "good
enough" is my call, and the worst case is iterating the prompt — the
architecture survives.

## Resolved ambiguities (so I don't relitigate them mid-build)
- **Card count:** fixed at 8.
- **Body format:** plain text only. No Markdown editor, no rich text.
- **Chat architecture:** full note in context, single-shot, stateless.
- **Public URL:** gated. Basic auth or a secret path — pick whichever is
  faster on Day 7.
- **Flashcard regeneration:** replaces the prior set for that note. Cards
  are tied to the note's lifetime; deleting a note deletes its cards.
