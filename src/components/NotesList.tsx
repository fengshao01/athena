"use client";

import Link from "next/link";
import type { listNotes } from "@/app/notes/actions";

type Notes = Awaited<ReturnType<typeof listNotes>>;

export default function NotesList({ notes }: { notes: Notes }) {
  if (notes.length === 0) {
    return <p className="text-muted-foreground text-sm">No notes yet.</p>;
  }

  return (
    <ul className="-mx-2 flex flex-col divide-y divide-border">
      {notes.map((note) => (
        <li key={note.id}>
          <Link
            href={`/notes/${note.id}`}
            className="hover:bg-muted flex flex-col gap-0.5 rounded px-2 py-3"
          >
            <span className="font-medium break-words">
              {note.title || "Untitled"}
            </span>
            <span
              className="text-muted-foreground text-xs"
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
