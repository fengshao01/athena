"use client";

import Link from "next/link";
import { generateCards, useCards, useIsClient, useNote } from "@/lib/notes-store";

export default function NoteDetail({ noteId }: { noteId: string }) {
  const note = useNote(noteId);
  const cards = useCards(noteId);
  const isClient = useIsClient();

  if (!isClient) {
    return <p className="text-sm text-zinc-500">Loading…</p>;
  }

  if (!note) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-zinc-500">Note not found.</p>
        <Link href="/notes" className="text-sm underline">
          Back to notes
        </Link>
      </div>
    );
  }

  return (
    <article className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">{note.title}</h1>
      {note.body && (
        <p className="whitespace-pre-wrap text-sm text-zinc-700 dark:text-zinc-300">
          {note.body}
        </p>
      )}
      <div className="flex items-center gap-3 border-t border-zinc-200 pt-4 dark:border-zinc-800">
        <button
          type="button"
          onClick={() => generateCards(noteId)}
          className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {cards.length === 0 ? "Generate flashcards" : "Regenerate flashcards"}
        </button>
        {cards.length > 0 && (
          <Link
            href={`/notes/${noteId}/practice`}
            className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
          >
            Practice ({cards.length})
          </Link>
        )}
      </div>
      {cards.length > 0 && (
        <section>
          <h2 className="mb-2 text-xs font-medium uppercase tracking-wider text-zinc-500">
            Cards
          </h2>
          <ul className="flex flex-col gap-2">
            {cards.map((c) => (
              <li
                key={c.id}
                className="rounded-md border border-zinc-200 p-3 text-sm dark:border-zinc-800"
              >
                <div className="font-medium">{c.front}</div>
                <div className="mt-1 text-zinc-500">{c.back}</div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
