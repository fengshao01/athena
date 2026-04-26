"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import { toast } from "sonner";
import { createNote } from "@/app/notes/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function NewNoteForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    startTransition(async () => {
      try {
        const note = await createNote({ title: trimmed, body });
        router.push(`/notes/${note.id}`);
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Failed to create note.",
        );
      }
    });
  }

  return (
    <Card>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">Title</span>
            <Input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isPending}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">Body</span>
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={12}
              disabled={isPending}
              className="font-mono"
            />
          </label>
          <div>
            <Button type="submit" disabled={!title.trim() || isPending}>
              {isPending ? "Saving…" : "Save"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
