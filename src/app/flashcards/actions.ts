"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db, isUuid } from "@/db";
import { flashcards, reviews, type Flashcard } from "@/db/schema";

const HARDCODED_CARDS: ReadonlyArray<{ front: string; back: string }> = [
  { front: "Sample front 1", back: "Sample back 1" },
  { front: "Sample front 2", back: "Sample back 2" },
  { front: "Sample front 3", back: "Sample back 3" },
];

export async function createFlashcards(
  noteId: string,
  cards: ReadonlyArray<{ front: string; back: string }> = HARDCODED_CARDS,
): Promise<Flashcard[]> {
  // Replace semantics: drop existing cards for this note, then insert the new
  // set. neon-http runs each statement as a separate request — not a true
  // SQL transaction. For v1 this is acceptable; switch to neon-serverless if
  // we need atomicity.
  await db.delete(flashcards).where(eq(flashcards.noteId, noteId));
  const inserted =
    cards.length === 0
      ? []
      : await db
          .insert(flashcards)
          .values(
            cards.map((c) => ({ noteId, front: c.front, back: c.back })),
          )
          .returning();
  revalidatePath(`/notes/${noteId}`);
  revalidatePath(`/notes/${noteId}/practice`);
  return inserted;
}

export async function listForNote(noteId: string): Promise<Flashcard[]> {
  if (!isUuid(noteId)) return [];
  return db.select().from(flashcards).where(eq(flashcards.noteId, noteId));
}

export async function recordReview(
  flashcardId: string,
  rating: "got" | "missed",
): Promise<void> {
  await db.insert(reviews).values({ flashcardId, rating });
}
