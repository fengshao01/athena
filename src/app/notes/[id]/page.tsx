import Link from "next/link";
import NoteDetail from "@/components/NoteDetail";

export default async function NotePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
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
      <NoteDetail noteId={id} />
    </div>
  );
}
