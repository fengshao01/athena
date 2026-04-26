"use server";

import { asc, eq } from "drizzle-orm";
import { db, isUuid } from "@/db";
import { chatMessages, type ChatMessage } from "@/db/schema";

export async function listChatMessages(
  noteId: string,
): Promise<ChatMessage[]> {
  if (!isUuid(noteId)) return [];
  return db
    .select()
    .from(chatMessages)
    .where(eq(chatMessages.noteId, noteId))
    .orderBy(asc(chatMessages.createdAt));
}
