import { notFound } from "next/navigation";
import NoteDetail from "@/components/NoteDetail";

// Test fixture: renders NoteDetail with a synthetic note containing a very
// long no-space title and a long body so Playwright can verify break-words
// and the body collapse toggle.
// 404s in production so it's safe to ship.
export default function TestLongNote() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  const longTitle = "a".repeat(200);
  const longBody = "Lorem ipsum dolor sit amet. ".repeat(200);

  const note = {
    id: "00000000-0000-0000-0000-000000000000",
    title: longTitle,
    body: longBody,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-12">
      <NoteDetail note={note} cards={[]} />
    </div>
  );
}
