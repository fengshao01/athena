"use server";

import { anthropic } from "@ai-sdk/anthropic";
import { generateText, type ModelMessage } from "ai";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import { flashcards, notes, reviews, type Flashcard } from "@/db/schema";

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
  return db.select().from(flashcards).where(eq(flashcards.noteId, noteId));
}

export async function recordReview(
  flashcardId: string,
  rating: "got" | "missed",
): Promise<void> {
  await db.insert(reviews).values({ flashcardId, rating });
}

const FlashcardSchema = z.object({
  front: z.string().min(1),
  back: z.string().min(1),
});

const FlashcardsResponseSchema = z.array(FlashcardSchema).min(1).max(20);

const GENERATE_SYSTEM_PROMPT = `You generate study flashcards from notes provided by the user.

OUTPUT FORMAT
Output ONLY a JSON array. No prose, no preamble, no explanations, no markdown code fences. Each element must be an object with exactly two string fields:
  { "front": "<question or prompt>", "back": "<answer>" }

CARD DESIGN
- One concept per card. If a card would teach two things, split it.
- Front: a clear, specific question or prompt that names what is being asked.
- Back: a concise, self-contained answer.
- Plain text only. No markdown, no HTML, no LaTeX.
- Cards must stand alone — understandable without re-reading the note.
- Cover durable, memorizable concepts. Skip trivia, throwaway examples, and anything that just restates the wording of the note.

QUANTITY
Aim for 5–12 cards, scaled to the note's substance:
- Short paragraph (~100 words): 3–6 cards.
- Standard article (~500–2000 words): 8–12 cards.
- Never exceed 15.

Return only the JSON array.`;

function extractJsonArray(text: string): unknown {
  // Tolerate code fences and stray prose: locate the outer `[ ... ]`.
  const start = text.indexOf("[");
  const end = text.lastIndexOf("]");
  if (start === -1 || end === -1 || end < start) return null;
  try {
    return JSON.parse(text.slice(start, end + 1));
  } catch {
    return null;
  }
}

export async function generateFlashcards(
  noteId: string,
): Promise<Flashcard[]> {
  const [note] = await db
    .select()
    .from(notes)
    .where(eq(notes.id, noteId))
    .limit(1);
  if (!note) {
    throw new Error("Note not found.");
  }

  const messages: ModelMessage[] = [
    { role: "user", content: `Title: ${note.title}\n\n${note.body}` },
  ];

  let parsed: z.infer<typeof FlashcardsResponseSchema> | null = null;

  for (let attempt = 0; attempt < 2; attempt++) {
    const { text } = await generateText({
      model: anthropic("claude-sonnet-4-6"),
      system: GENERATE_SYSTEM_PROMPT,
      messages,
    });

    const result = FlashcardsResponseSchema.safeParse(extractJsonArray(text));
    if (result.success) {
      parsed = result.data;
      break;
    }

    if (attempt === 0) {
      messages.push({ role: "assistant", content: text });
      messages.push({
        role: "user",
        content:
          "Your last response was invalid JSON; try again. Output ONLY the JSON array of flashcards, with no other text.",
      });
    }
  }

  if (!parsed) {
    throw new Error(
      "Flashcard generation failed: model did not return valid JSON.",
    );
  }

  await db.delete(flashcards).where(eq(flashcards.noteId, noteId));
  const inserted = await db
    .insert(flashcards)
    .values(
      parsed.map((c) => ({ noteId, front: c.front, back: c.back })),
    )
    .returning();

  revalidatePath(`/notes/${noteId}`);
  revalidatePath(`/notes/${noteId}/practice`);
  return inserted;
}
