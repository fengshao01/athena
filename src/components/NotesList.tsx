"use client";

import Link from "next/link";
import type { listNotes } from "@/app/notes/actions";

type Notes = Awaited<ReturnType<typeof listNotes>>;

export default function NotesList({ notes }: { notes: Notes }) {
  if (notes.length === 0) {
    return <p className="text-sm text-zinc-500">No notes yet.</p>;
  }

  return (
    <ul className="-mx-2 flex flex-col divide-y divide-zinc-200 dark:divide-zinc-800">
      {notes.map((note) => (
        <li key={note.id}>
          <Link
            href={`/notes/${note.id}`}
            className="flex flex-col gap-0.5 rounded px-2 py-3 hover:bg-zinc-100 dark:hover:bg-zinc-900"
          >
            <span className="font-medium">{note.title || "Untitled"}</span>
            <span
              className="text-xs text-zinc-500"
              suppressHydrationWarning
            >
              {note.createdAt.toLocaleString()}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
