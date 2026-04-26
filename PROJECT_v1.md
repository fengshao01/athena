# Athena — an AI study companion

## What it is
A web app that turns my notes into flashcards and lets me chat with my own
knowledge. I drop in lecture notes, a textbook chapter, or a Wikipedia article;
Athena generates study flashcards from it and answers questions grounded in
that note's content.

## Who it's for
Me — a college student who wants to internalize material faster and review
without re-reading the source.

## v1 goals (what "done" looks like)
- Create a note (title + body); see it in a list at /notes.
- "Generate flashcards" button on a note produces 5–12 Q/A cards, saved to
  the database.
- Practice mode: show card front, click to flip, mark "got it" / "missed",
  advance to the next card.
- Chat with a single note: ask questions, get answers grounded in the note's
  content. The model should say "I don't know" when the answer isn't there.
- Deployed at a public URL.

## Non-goals for v1 (explicitly NOT building these)
- Multi-user / accounts. Just me for now.
- Spaced-repetition scheduling. v1 lets me practice; smart scheduling is v2.
- Cross-note retrieval. v1 is one-note-at-a-time.
- File uploads (PDF, audio). v1 is plain text only.
- Mobile-first UI. Desktop is fine; mobile is a stretch.

## Data shapes (rough — refine on Day 3)
- Note      { id, title, body, createdAt, updatedAt }
- Flashcard { id, noteId, front, back, createdAt }
- Review    { id, flashcardId, rating ("got" | "missed"), reviewedAt }
- ChatMessage { id, noteId, role ("user" | "assistant"), content, createdAt }

## The Day 7 demo
1. Visit the live URL.
2. Paste in a Wikipedia article on a topic I'm learning.
3. Click "Generate flashcards" — ~8 cards appear.
4. Run the quiz — flip cards, mark each.
5. Open the chat — ask "what's the key takeaway?"
6. Athena answers using only the note's content.

## The riskiest assumption
That a single-prompt flashcard generator produces good-enough cards without
per-subject tuning. If cards are bad, I'll iterate on the system prompt —
not the architecture.
