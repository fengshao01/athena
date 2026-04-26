import { z } from "zod";

export const FlashcardSchema = z.object({
  front: z.string().min(1),
  back: z.string().min(1),
});

export const FlashcardsObjectSchema = z.object({
  cards: z.array(FlashcardSchema).min(1).max(20),
});

export const GENERATE_SYSTEM_PROMPT = `You generate study flashcards from notes provided by the user.

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
- Never exceed 15.`;
