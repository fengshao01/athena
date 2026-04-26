"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { recordReview, type listForNote } from "@/app/flashcards/actions";
import { Button } from "@/components/ui/button";

type Cards = Awaited<ReturnType<typeof listForNote>>;

export default function Practice({
  noteId,
  cards,
}: {
  noteId: string;
  cards: Cards;
}) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  if (cards.length === 0) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-muted-foreground text-sm">
          No cards yet — generate some first.
        </p>
        <Link
          href={`/notes/${noteId}`}
          className="text-sm underline underline-offset-4"
        >
          Back to note
        </Link>
      </div>
    );
  }

  if (index >= cards.length) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-semibold">Done.</h1>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => {
              setIndex(0);
              setFlipped(false);
            }}
          >
            Practice again
          </Button>
          <Button asChild>
            <Link href={`/notes/${noteId}`}>Back to note</Link>
          </Button>
        </div>
      </div>
    );
  }

  const card = cards[index];

  function rate(rating: "got" | "missed") {
    const cardId = card.id;
    recordReview(cardId, rating).catch(() => {
      toast.error("Couldn't save rating.");
    });
    setFlipped(false);
    setIndex((i) => i + 1);
  }

  return (
    <div className="flex flex-col gap-6">
      <p className="text-muted-foreground text-xs">
        Card {index + 1} of {cards.length}
      </p>
      <Button
        variant="outline"
        onClick={() => setFlipped((f) => !f)}
        className="h-auto min-h-48 justify-start whitespace-normal p-6 text-left text-lg"
      >
        {flipped ? card.back : card.front}
      </Button>
      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={() => rate("missed")}
          className="flex-1"
        >
          Missed
        </Button>
        <Button onClick={() => rate("got")} className="flex-1">
          Got it
        </Button>
      </div>
    </div>
  );
}
