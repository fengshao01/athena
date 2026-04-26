import { notFound } from "next/navigation";
import NoteDetail from "@/components/NoteDetail";

// Test fixture: renders NoteDetail with one synthetic card so the
// "Regenerate flashcards" path (and its confirm Dialog) is reachable
// without touching the real database. 404s in production.
export default function TestWithCards() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  const note = {
    id: "00000000-0000-0000-0000-000000000000",
    title: "Test note",
    body: "Short body.",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const cards = [
    {
      id: "fixture-card-1",
      noteId: note.id,
      front: "Q1",
      back: "A1",
      createdAt: new Date(),
    },
  ];

  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-12">
      <NoteDetail note={note} cards={cards} />
    </div>
  );
}
