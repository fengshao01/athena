"use client";

import { BookOpenIcon, Loader2Icon, SparklesIcon } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import type { getNote } from "@/app/notes/actions";
import { generateFlashcards, type listForNote } from "@/app/flashcards/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Note = NonNullable<Awaited<ReturnType<typeof getNote>>>;
type Cards = Awaited<ReturnType<typeof listForNote>>;

export default function NoteDetail({
  note,
  cards,
}: {
  note: Note;
  cards: Cards;
}) {
  const [isPending, startTransition] = useTransition();
  const [confirmOpen, setConfirmOpen] = useState(false);

  function runGenerate() {
    startTransition(async () => {
      try {
        const created = await generateFlashcards(note.id);
        toast.success(`Generated ${created.length} flashcards.`);
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Generation failed.",
        );
      }
    });
  }

  function handleClick() {
    if (cards.length === 0) {
      runGenerate();
    } else {
      setConfirmOpen(true);
    }
  }

  function confirmRegenerate() {
    setConfirmOpen(false);
    runGenerate();
  }

  return (
    <article className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">{note.title}</h1>
      {note.body && (
        <p className="text-muted-foreground whitespace-pre-wrap text-sm">
          {note.body}
        </p>
      )}

      <div className="flex items-center gap-3 border-t border-border pt-4">
        <Button onClick={handleClick} disabled={isPending}>
          {isPending ? (
            <Loader2Icon className="animate-spin" />
          ) : (
            <SparklesIcon />
          )}
          {isPending
            ? "Generating…"
            : cards.length === 0
              ? "Generate flashcards"
              : "Regenerate flashcards"}
        </Button>
        {cards.length > 0 && (
          <Button asChild variant="outline">
            <Link href={`/notes/${note.id}/practice`}>
              <BookOpenIcon />
              Practice ({cards.length})
            </Link>
          </Button>
        )}
      </div>

      {cards.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
            Cards
          </h2>
          <ul className="flex flex-col gap-2">
            {cards.map((c) => (
              <li key={c.id}>
                <Card size="sm">
                  <CardContent className="flex flex-col gap-2.5">
                    <div className="font-medium">{c.front}</div>
                    <div className="border-t border-border pt-2.5">
                      {c.back}
                    </div>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        </section>
      )}

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Regenerate flashcards?</DialogTitle>
            <DialogDescription>
              This will replace the existing {cards.length} card
              {cards.length === 1 ? "" : "s"} for this note.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={confirmRegenerate}>Regenerate</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </article>
  );
}
