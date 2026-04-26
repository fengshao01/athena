"use client";

import { experimental_useObject as useObject } from "@ai-sdk/react";
import {
  BookOpenIcon,
  Loader2Icon,
  SparklesIcon,
  SquareIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { type listForNote } from "@/app/flashcards/actions";
import { FlashcardsObjectSchema } from "@/app/flashcards/schema";
import type { getNote } from "@/app/notes/actions";
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
import { cn } from "@/lib/utils";

type Note = NonNullable<Awaited<ReturnType<typeof getNote>>>;
type Cards = Awaited<ReturnType<typeof listForNote>>;

const BODY_COLLAPSE_THRESHOLD = 400;

type DisplayCard = { id: string; front: string; back: string };

export default function NoteDetail({
  note,
  cards,
}: {
  note: Note;
  cards: Cards;
}) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [bodyExpanded, setBodyExpanded] = useState(false);

  const { object, submit, isLoading, stop, error } = useObject({
    api: "/api/flashcards/generate",
    schema: FlashcardsObjectSchema,
    onFinish: ({ object: finalObject }) => {
      if (finalObject) {
        toast.success(`Generated ${finalObject.cards.length} flashcards.`);
        router.refresh();
      }
    },
  });

  useEffect(() => {
    if (error) {
      toast.error(error.message);
    }
  }, [error]);

  const isBodyLong = note.body.length > BODY_COLLAPSE_THRESHOLD;
  const collapseBody = isBodyLong && !bodyExpanded;

  const streamingCards: DisplayCard[] = (object?.cards ?? []).map((c, i) => ({
    id: `streaming-${i}`,
    front: c?.front ?? "",
    back: c?.back ?? "",
  }));

  const cardsToShow: DisplayCard[] = isLoading ? streamingCards : cards;

  function runGenerate() {
    submit({ noteId: note.id });
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
      <h1 className="text-2xl font-semibold break-words">{note.title}</h1>
      {note.body && (
        <div className="flex flex-col gap-2">
          <p
            className={cn(
              "text-muted-foreground text-sm whitespace-pre-wrap break-words",
              collapseBody && "max-h-64 overflow-hidden",
            )}
          >
            {note.body}
          </p>
          {isBodyLong && (
            <div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setBodyExpanded((v) => !v)}
              >
                {bodyExpanded ? "Show less" : "Show more"}
              </Button>
            </div>
          )}
        </div>
      )}

      <div className="flex items-center gap-3 border-t border-border pt-4">
        <Button onClick={handleClick} disabled={isLoading}>
          {isLoading ? (
            <Loader2Icon className="animate-spin" />
          ) : (
            <SparklesIcon />
          )}
          {isLoading
            ? "Generating…"
            : cards.length === 0
              ? "Generate flashcards"
              : "Regenerate flashcards"}
        </Button>
        {isLoading && (
          <Button type="button" variant="outline" onClick={() => stop()}>
            <SquareIcon />
            Stop
          </Button>
        )}
        {!isLoading && cards.length > 0 && (
          <Button asChild variant="outline">
            <Link href={`/notes/${note.id}/practice`}>
              <BookOpenIcon />
              Practice ({cards.length})
            </Link>
          </Button>
        )}
      </div>

      {cardsToShow.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
            Cards
          </h2>
          <ul className="flex flex-col gap-2">
            {cardsToShow.map((c) => (
              <li key={c.id}>
                <Card size="sm">
                  <CardContent className="flex flex-col gap-2.5">
                    <div className="font-medium break-words">{c.front}</div>
                    <div className="border-t border-border pt-2.5 break-words">
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
