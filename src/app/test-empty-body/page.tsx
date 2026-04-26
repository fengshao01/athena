import { notFound } from "next/navigation";
import NoteDetail from "@/components/NoteDetail";

// Test fixture: renders NoteDetail with an empty-body note so the
// Playwright spec can verify the Generate button refuses with a toast
// instead of calling the model. 404s in production.
export default function TestEmptyBody() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  const note = {
    id: "00000000-0000-0000-0000-000000000000",
    title: "Empty body fixture",
    body: "",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-12">
      <NoteDetail note={note} cards={[]} />
    </div>
  );
}
