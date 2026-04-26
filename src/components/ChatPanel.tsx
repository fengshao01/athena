"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, isTextUIPart, type UIMessage } from "ai";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";
import type { listChatMessages } from "@/app/chat/actions";

type Initial = Awaited<ReturnType<typeof listChatMessages>>;

function toUIMessage(m: Initial[number]): UIMessage {
  return {
    id: m.id,
    role: m.role,
    parts: [{ type: "text", text: m.content }],
  };
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

  const isStreaming = status === "submitted" || status === "streaming";

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const text = input.trim();
    if (!text || isStreaming) return;
    void sendMessage({ text });
    setInput("");
  }

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-xs font-medium uppercase tracking-wider text-zinc-500">
        Chat
      </h2>

      <div className="rounded-md border border-zinc-200 dark:border-zinc-800">
        <div className="max-h-96 overflow-y-auto p-3">
          {messages.length === 0 ? (
            <p className="text-sm text-zinc-400">
              Ask a question about this note.
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {messages.map((m) => (
                <li
                  key={m.id}
                  className={
                    m.role === "user"
                      ? "max-w-[85%] self-end rounded-md bg-zinc-900 px-3 py-2 text-sm text-white dark:bg-zinc-50 dark:text-zinc-900"
                      : "max-w-[85%] self-start rounded-md bg-zinc-100 px-3 py-2 text-sm text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100"
                  }
                >
                  <div className="whitespace-pre-wrap">
                    {m.parts
                      .filter(isTextUIPart)
                      .map((p) => p.text)
                      .join("")}
                  </div>
                </li>
              ))}
            </ul>
          )}
          <div ref={bottomRef} />
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex gap-2 border-t border-zinc-200 p-3 dark:border-zinc-800"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Athena…"
            disabled={isStreaming}
            className="flex-1 rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900"
          />
          {isStreaming ? (
            <button
              type="button"
              onClick={() => void stop()}
              className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
            >
              Stop
            </button>
          ) : (
            <button
              type="submit"
              disabled={!input.trim()}
              className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Send
            </button>
          )}
        </form>

        {error && (
          <p className="border-t border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900 dark:border-red-900 dark:bg-red-950 dark:text-red-100">
            {error.message}
          </p>
        )}
      </div>
    </section>
  );
}
