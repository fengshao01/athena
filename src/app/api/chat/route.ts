import { anthropic } from "@ai-sdk/anthropic";
import {
  convertToModelMessages,
  isTextUIPart,
  streamText,
  type UIMessage,
} from "ai";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { chatMessages, notes } from "@/db/schema";

export async function POST(req: Request) {
  const { messages, noteId } = (await req.json()) as {
    messages: UIMessage[];
    noteId: string;
  };

  const [note] = await db
    .select()
    .from(notes)
    .where(eq(notes.id, noteId))
    .limit(1);
  if (!note) {
    return new Response("Note not found", { status: 404 });
  }

  // Persist the latest user message before we start streaming. If the model
  // call fails after this, the question still appears in the thread on
  // reload — which matches what the user just typed and saw on screen.
  const last = messages[messages.length - 1];
  if (last?.role === "user") {
    const content = last.parts
      .filter(isTextUIPart)
      .map((p) => p.text)
      .join("");
    if (content) {
      await db.insert(chatMessages).values({
        noteId,
        role: "user",
        content,
      });
    }
  }

  const system = `You are Athena, a study coach. Answer the user's questions about the following note. If the answer isn't in the note, say so honestly. Note:\n\n${note.body}`;

  const modelMessages = await convertToModelMessages(messages);

  const result = streamText({
    model: anthropic("claude-sonnet-4-6"),
    system,
    messages: modelMessages,
    onFinish: async ({ text }) => {
      // Fires on normal completion, abort, length cap, and error. We persist
      // whatever was generated — partial responses included — so the saved
      // thread reflects what the user actually saw.
      if (!text) return;
      await db.insert(chatMessages).values({
        noteId,
        role: "assistant",
        content: text,
      });
    },
  });

  return result.toUIMessageStreamResponse();
}
