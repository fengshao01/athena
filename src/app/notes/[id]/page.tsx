import Link from "next/link";
import NoteDetail from "@/components/NoteDetail";
import { listForNote } from "@/app/flashcards/actions";
import { getNote } from "../actions";

export default async function NotePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [note, cards] = await Promise.all([getNote(id), listForNote(id)]);

  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-12">
      <header className="mb-6">
        <Link
          href="/notes"
          className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
        >
          ← Notes
        </Link>
      </header>
      {note ? (
        <NoteDetail note={note} cards={cards} />
      ) : (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-zinc-500">Note not found.</p>
          <Link href="/notes" className="text-sm underline">
            Back to notes
          </Link>
        </div>
      )}
    </div>
  );
}
