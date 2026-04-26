import Link from "next/link";
import NotesList from "@/components/NotesList";
import { Button } from "@/components/ui/button";
import { listNotes } from "./actions";

export default async function NotesPage() {
  const notes = await listNotes();

  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-12">
      <header className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Notes</h1>
        <Button asChild>
          <Link href="/notes/new">New note</Link>
        </Button>
      </header>
      <NotesList notes={notes} />
    </div>
  );
}
