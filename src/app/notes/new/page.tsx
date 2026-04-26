import Link from "next/link";
import NewNoteForm from "@/components/NewNoteForm";

export default function NewNotePage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-12">
      <header className="mb-8">
        <Link
          href="/notes"
          className="text-muted-foreground hover:text-foreground text-sm"
        >
          ← Notes
        </Link>
        <h1 className="mt-2 text-2xl font-semibold">New note</h1>
      </header>
      <NewNoteForm />
    </div>
  );
}
