"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import type { getNote } from "@/app/notes/actions";
import { generateFlashcards, type listForNote } from "@/app/flashcards/actions";

type Note = NonNullable<Awaited<ReturnType<typeof getNote>>>;
type Cards = Awaited<ReturnType<typeof listForNote>>;

export default function NoteDetail({
  note,
  cards,
}: {
  note: Note;
  cards: Cards;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!error) return;
    const t = setTimeout(() => setError(null), 5000);
    return () => clearTimeout(t);
  }, [error]);

  function generate() {
    setError(null);
    startTransition(async () => {
      try {
        await generateFlashcards(note.id);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong.");
      }
    });
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
          onClick={generate}
          disabled={isPending}
          className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {isPending
            ? "Generating…"
            : cards.length === 0
              ? "Generate flashcards"
              : "Regenerate flashcards"}
        </button>
        {cards.length > 0 && (
          <Link
            href={`/notes/${note.id}/practice`}
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

      {error && (
        <div
          role="alert"
          className="fixed bottom-4 left-1/2 -translate-x-1/2 rounded-md border border-red-300 bg-red-50 px-4 py-2 text-sm text-red-900 shadow-md dark:border-red-700 dark:bg-red-950 dark:text-red-100"
        >
          {error}
        </div>
      )}
    </article>
  );
}
