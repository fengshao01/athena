import Link from "next/link";
import NotesList from "@/components/NotesList";
import { listNotes } from "./actions";

export default async function NotesPage() {
  const notes = await listNotes();

  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-12">
      <header className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Notes</h1>
        <Link
          href="/notes/new"
          className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          New note
        </Link>
      </header>
      <NotesList notes={notes} />
    </div>
  );
}
