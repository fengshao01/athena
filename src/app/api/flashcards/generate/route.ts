import { anthropic } from "@ai-sdk/anthropic";
import { streamObject } from "ai";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db, isUuid } from "@/db";
import {
  FlashcardsObjectSchema,
  GENERATE_SYSTEM_PROMPT,
} from "@/app/flashcards/schema";
import { flashcards, notes } from "@/db/schema";

export async function POST(req: Request) {
  const { noteId } = (await req.json()) as { noteId: string };

  if (!isUuid(noteId)) {
    return new Response("Invalid note id", { status: 400 });
  }

  const [note] = await db
    .select()
    .from(notes)
    .where(eq(notes.id, noteId))
    .limit(1);
  if (!note) {
    return new Response("Note not found", { status: 404 });
  }

  if (!note.body.trim()) {
    return new Response("Add some content to the note first.", {
      status: 400,
    });
  }

  const result = streamObject({
    model: anthropic("claude-sonnet-4-6"),
    schema: FlashcardsObjectSchema,
    system: GENERATE_SYSTEM_PROMPT,
    prompt: `Title: ${note.title}\n\n${note.body}`,
    onFinish: async ({ object }) => {
      // Fires once the stream is fully consumed and the schema validates.
      // We await the writes here so the response stream stays open until
      // persistence is done — the client's isLoading flips to false only
      // after the new cards are in the DB, so router.refresh() picks them up.
      if (!object) return;
      await db.delete(flashcards).where(eq(flashcards.noteId, noteId));
      await db.insert(flashcards).values(
        object.cards.map((c) => ({
          noteId,
          front: c.front,
          back: c.back,
        })),
      );
      revalidatePath(`/notes/${noteId}`);
      revalidatePath(`/notes/${noteId}/practice`);
    },
  });

  return result.toTextStreamResponse();
}
