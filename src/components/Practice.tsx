"use client";

import Link from "next/link";
import { useState } from "react";
import { useCards, useIsClient } from "@/lib/notes-store";

export default function Practice({ noteId }: { noteId: string }) {
  const cards = useCards(noteId);
  const isClient = useIsClient();
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  if (!isClient) {
    return <p className="text-sm text-zinc-500">Loading…</p>;
  }

  if (cards.length === 0) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-zinc-500">
          No cards yet — generate some first.
        </p>
        <Link href={`/notes/${noteId}`} className="text-sm underline">
          Back to note
        </Link>
      </div>
    );
  }

  if (index >= cards.length) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-semibold">Done.</h1>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => {
              setIndex(0);
              setFlipped(false);
            }}
            className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
          >
            Practice again
          </button>
          <Link
            href={`/notes/${noteId}`}
            className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Back to note
          </Link>
        </div>
      </div>
    );
  }

  const card = cards[index];

  function advance() {
    setFlipped(false);
    setIndex((i) => i + 1);
  }

  return (
    <div className="flex flex-col gap-6">
      <p className="text-xs text-zinc-500">
        Card {index + 1} of {cards.length}
      </p>
      <button
        type="button"
        onClick={() => setFlipped((f) => !f)}
        className="min-h-48 rounded-lg border border-zinc-300 p-6 text-left text-lg hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
      >
        {flipped ? card.back : card.front}
      </button>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={advance}
          className="flex-1 rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
        >
          Missed
        </button>
        <button
          type="button"
          onClick={advance}
          className="flex-1 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
