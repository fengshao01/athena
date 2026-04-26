# UX/edge-case fix queue

Sorted by impact-to-effort. The loop picks the first `- [ ]` and works it end-to-end.

- [x] **1. Add `src/app/error.tsx`** — global error boundary so uncaught Server Component throws (DB hiccup, Anthropic 401, malformed UUID) don't show Next's default error UI.
- [ ] **2. Add `src/app/notes/[id]/loading.tsx`** — Skeleton card + Skeleton chat panel during cold-fetch.
- [ ] **3. Validate UUIDs before DB lookup** — gate `getNote` / `listForNote` / `listChatMessages` so `/notes/abc` returns the not-found branch instead of 500.
- [ ] **4. Run the shadcn sweep on `/notes` and `/notes/new`** — replace "New note" link with `<Button asChild>`; swap `text-zinc-* / divide-zinc-*` for semantic tokens (`text-muted-foreground`, `border-border`, `hover:bg-muted`).
- [ ] **5. Title `break-words` + body collapse with "Show more"** — add `break-words` to titles + flashcard front/back; cap note body at `max-h-64` with toggle.
- [ ] **6. Stream flashcard generation progressively** — switch `generateFlashcards` from `generateText` to `streamObject` so cards appear as they arrive.
- [ ] **7. `variant="destructive"` on the Regenerate button in the confirm Dialog**.
- [ ] **8. Add `cyrillic`, `cyrillic-ext`, `latin-ext` subsets to the Geist fonts in `layout.tsx`**.
- [ ] **9. Empty-body guard in `generateFlashcards`** — refuse with `toast.error("Add some content first.")` if `note.body.trim() === ""`.
- [ ] **10. Surface `recordReview` failure** — replace `.catch(() => {})` in `Practice.tsx` with a `toast.error`.
