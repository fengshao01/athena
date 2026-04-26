"use client";

import { useState, useSyncExternalStore, type FormEvent } from "react";

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
      items.map((item) => (item.id === id ? { ...item, done: !item.done } : item)),
    );
  }

  function remove(id: string) {
    writeItems(items.filter((item) => item.id !== id));
  }

  return (
    <section>
      <h2 className="mb-3 text-xs font-medium uppercase tracking-wider text-zinc-500">
        Things to remember
      </h2>

      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Add something…"
          className="flex-1 rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
        />
        <button
          type="submit"
          disabled={!draft.trim()}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Add
        </button>
      </form>

      <ul className="mt-4 flex flex-col gap-1">
        {items.map((item) => (
          <li
            key={item.id}
            className="group flex items-center gap-3 rounded-md px-2 py-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-900"
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
                  ? "flex-1 text-sm text-zinc-400 line-through"
                  : "flex-1 text-sm text-zinc-900 dark:text-zinc-50"
              }
            >
              {item.text}
            </span>
            <button
              type="button"
              onClick={() => remove(item.id)}
              aria-label={`Delete "${item.text}"`}
              className="rounded px-2 text-zinc-400 opacity-0 hover:bg-zinc-200 hover:text-zinc-700 group-hover:opacity-100 focus:opacity-100 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
            >
              ×
            </button>
          </li>
        ))}
        {isClient && items.length === 0 && (
          <li className="px-2 py-1.5 text-sm text-zinc-400">Nothing yet.</li>
        )}
      </ul>
    </section>
  );
}
