"use client";

import { useState, useSyncExternalStore, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Item = { id: string; text: string; done: boolean };

const STORAGE_KEY = "dashboard:remembers";
const CHANGE_EVENT = "dashboard:remembers:change";

let cache: { raw: string | null; items: Item[] } = { raw: "__init__", items: [] };

function readItems(): Item[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw === cache.raw) return cache.items;
  let items: Item[] = [];
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) items = parsed;
    } catch {
      items = [];
    }
  }
  cache = { raw, items };
  return items;
}

function writeItems(next: Item[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

function subscribe(callback: () => void) {
  window.addEventListener(CHANGE_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(CHANGE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

const EMPTY: Item[] = [];
const getServerSnapshot = (): Item[] => EMPTY;

const subscribeClient = () => () => {};
const getClientSnapshot = () => true;
const getClientServerSnapshot = () => false;

export default function RemembersList() {
  const items = useSyncExternalStore(subscribe, readItems, getServerSnapshot);
  const isClient = useSyncExternalStore(
    subscribeClient,
    getClientSnapshot,
    getClientServerSnapshot,
  );
  const [draft, setDraft] = useState("");

  function handleAdd(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    writeItems([...items, { id: crypto.randomUUID(), text, done: false }]);
    setDraft("");
  }

  function toggle(id: string) {
    writeItems(
      items.map((item) =>
        item.id === id ? { ...item, done: !item.done } : item,
      ),
    );
  }

  function remove(id: string) {
    writeItems(items.filter((item) => item.id !== id));
  }

  return (
    <section>
      <h2 className="text-muted-foreground mb-3 text-xs font-medium tracking-wider uppercase">
        Things to remember
      </h2>

      <form onSubmit={handleAdd} className="flex gap-2">
        <Input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Add something…"
        />
        <Button type="submit" disabled={!draft.trim()}>
          Add
        </Button>
      </form>

      <ul className="mt-4 flex flex-col gap-1">
        {items.map((item) => (
          <li
            key={item.id}
            className="group hover:bg-muted flex items-center gap-3 rounded-md px-2 py-1.5"
          >
            <input
              type="checkbox"
              checked={item.done}
              onChange={() => toggle(item.id)}
              className="h-4 w-4"
            />
            <span
              className={
                item.done
                  ? "text-muted-foreground flex-1 text-sm line-through"
                  : "flex-1 text-sm"
              }
            >
              {item.text}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={() => remove(item.id)}
              aria-label={`Delete "${item.text}"`}
              className="opacity-0 group-hover:opacity-100 focus:opacity-100"
            >
              ×
            </Button>
          </li>
        ))}
        {isClient && items.length === 0 && (
          <li className="text-muted-foreground px-2 py-1.5 text-sm">
            Nothing yet.
          </li>
        )}
      </ul>
    </section>
  );
}
