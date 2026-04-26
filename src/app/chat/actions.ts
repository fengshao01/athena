"use server";

import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { chatMessages, type ChatMessage } from "@/db/schema";

export async function listChatMessages(
  noteId: string,
): Promise<ChatMessage[]> {
  return db
    .select()
    .from(chatMessages)
    .where(eq(chatMessages.noteId, noteId))
    .orderBy(asc(chatMessages.createdAt));
}
