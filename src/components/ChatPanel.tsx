"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, isTextUIPart, type UIMessage } from "ai";
import {
  MessageSquareIcon,
  SendHorizonalIcon,
  SquareIcon,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";
import type { listChatMessages } from "@/app/chat/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

type Initial = Awaited<ReturnType<typeof listChatMessages>>;

function toUIMessage(m: Initial[number]): UIMessage {
  return {
    id: m.id,
    role: m.role,
    parts: [{ type: "text", text: m.content }],
  };
}

function textOf(m: UIMessage): string {
  return m.parts
    .filter(isTextUIPart)
    .map((p) => p.text)
    .join("");
}

export default function ChatPanel({
  noteId,
  initialMessages,
}: {
  noteId: string;
  initialMessages: Initial;
}) {
  const transport = useMemo(
    () =>
      new DefaultChatTransport<UIMessage>({
        api: "/api/chat",
        body: { noteId },
      }),
    [noteId],
  );

  const initial = useMemo(
    () => initialMessages.map(toUIMessage),
    [initialMessages],
  );

  const { messages, sendMessage, status, stop, error } = useChat({
    transport,
    messages: initial,
  });

  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  useEffect(() => {
    if (error) {
      toast.error(error.message);
    }
  }, [error]);

  const isStreaming = status === "submitted" || status === "streaming";
  const showPendingSkeleton = status === "submitted";

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const text = input.trim();
    if (!text || isStreaming) return;
    void sendMessage({ text });
    setInput("");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquareIcon className="size-4" />
          Chat
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="max-h-96 overflow-y-auto">
          {messages.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              Ask a question about this note.
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {messages.map((m) => (
                <li
                  key={m.id}
                  className={
                    m.role === "user"
                      ? "bg-primary text-primary-foreground max-w-[85%] self-end rounded-2xl px-3.5 py-2 text-sm"
                      : "bg-muted text-foreground max-w-[85%] self-start rounded-2xl px-3.5 py-2 text-sm"
                  }
                >
                  {m.role === "assistant" ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none [&>:first-child]:mt-0 [&>:last-child]:mb-0">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {textOf(m)}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <div className="whitespace-pre-wrap">{textOf(m)}</div>
                  )}
                </li>
              ))}
              {showPendingSkeleton && (
                <li className="bg-muted max-w-[85%] self-start rounded-2xl px-3.5 py-2.5">
                  <Skeleton className="h-3 w-32" />
                </li>
              )}
            </ul>
          )}
          <div ref={bottomRef} />
        </div>
      </CardContent>
      <CardFooter>
        <form onSubmit={handleSubmit} className="flex w-full gap-2">
          <Input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Athena…"
            disabled={isStreaming}
          />
          {isStreaming ? (
            <Button type="button" variant="outline" onClick={() => void stop()}>
              <SquareIcon />
              Stop
            </Button>
          ) : (
            <Button type="submit" disabled={!input.trim()}>
              <SendHorizonalIcon />
              Send
            </Button>
          )}
        </form>
      </CardFooter>
    </Card>
  );
}
