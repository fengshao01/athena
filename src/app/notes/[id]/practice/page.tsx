import Link from "next/link";
import Practice from "@/components/Practice";
import { listForNote } from "@/app/flashcards/actions";

export default async function PracticePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cards = await listForNote(id);

  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-12">
      <header className="mb-6">
        <Link
          href={`/notes/${id}`}
          className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
        >
          ← Note
        </Link>
      </header>
      <Practice noteId={id} cards={cards} />
    </div>
  );
}
