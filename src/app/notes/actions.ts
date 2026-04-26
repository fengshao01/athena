"use server";

import { desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { notes, type Note } from "@/db/schema";

export async function createNote(input: {
  title: string;
  body: string;
}): Promise<Note> {
  const [note] = await db
    .insert(notes)
    .values({ title: input.title, body: input.body })
    .returning();
  revalidatePath("/notes");
  return note!;
}

export async function listNotes(): Promise<Note[]> {
  return db.select().from(notes).orderBy(desc(notes.createdAt));
}

export async function getNote(id: string): Promise<Note | null> {
  const [note] = await db.select().from(notes).where(eq(notes.id, id)).limit(1);
  return note ?? null;
}

export async function deleteNote(id: string): Promise<void> {
  await db.delete(notes).where(eq(notes.id, id));
  revalidatePath("/notes");
}
