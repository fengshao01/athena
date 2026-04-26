import { notFound } from "next/navigation";
import Practice from "@/components/Practice";

// Test fixture: renders Practice with one synthetic card so the
// Playwright spec can exercise the rate() handler and the recordReview
// failure path. 404s in production.
export default function TestPractice() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  const noteId = "00000000-0000-0000-0000-000000000000";
  const cards = [
    {
      id: "11111111-1111-1111-1111-111111111111",
      noteId,
      front: "Q1",
      back: "A1",
      createdAt: new Date(),
    },
  ];

  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-12">
      <Practice noteId={noteId} cards={cards} />
    </div>
  );
}
