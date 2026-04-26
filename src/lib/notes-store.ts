"use client";

import { useSyncExternalStore } from "react";

export type Note = {
  id: string;
  title: string;
  body: string;
  createdAt: string;
};

export type Card = {
  id: string;
  noteId: string;
  front: string;
  back: string;
  createdAt: string;
};

const NOTES_KEY = "athena:notes";
const CARDS_KEY = "athena:cards";
const CHANGE_EVENT = "athena:store:change";

const EMPTY_NOTES: Note[] = [];
const EMPTY_CARDS: Card[] = [];

let notesCache: { raw: string | null; value: Note[] } = {
  raw: "__init__",
  value: EMPTY_NOTES,
};
let cardsCache: { raw: string | null; value: Card[] } = {
  raw: "__init__",
  value: EMPTY_CARDS,
};

function readNotes(): Note[] {
  const raw = localStorage.getItem(NOTES_KEY);
  if (raw === notesCache.raw) return notesCache.value;
  let value: Note[] = [];
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) value = parsed;
    } catch {
      value = [];
    }
  }
  notesCache = { raw, value };
  return value;
}

function writeNotes(next: Note[]) {
  const raw = JSON.stringify(next);
  notesCache = { raw, value: next };
  localStorage.setItem(NOTES_KEY, raw);
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

function readCards(): Card[] {
  const raw = localStorage.getItem(CARDS_KEY);
  if (raw === cardsCache.raw) return cardsCache.value;
  let value: Card[] = [];
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) value = parsed;
    } catch {
      value = [];
    }
  }
  cardsCache = { raw, value };
  return value;
}

function writeCards(next: Card[]) {
  const raw = JSON.stringify(next);
  cardsCache = { raw, value: next };
  localStorage.setItem(CARDS_KEY, raw);
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

const getNotesServerSnapshot = () => EMPTY_NOTES;
const getCardsServerSnapshot = () => EMPTY_CARDS;
const getNoteServerSnapshot = (): Note | null => null;

export function useNotes(): Note[] {
  return useSyncExternalStore(subscribe, readNotes, getNotesServerSnapshot);
}

// Per-id caches keyed by source-array reference: when the source array
// changes (new write), the WeakMap entry is GC'd and we re-derive.
const noteByIdCache = new WeakMap<Note[], Map<string, Note | null>>();

function readNote(id: string): Note | null {
  const all = readNotes();
  let map = noteByIdCache.get(all);
  if (!map) {
    map = new Map();
    noteByIdCache.set(all, map);
  }
  if (map.has(id)) return map.get(id) ?? null;
  const found = all.find((n) => n.id === id) ?? null;
  map.set(id, found);
  return found;
}

export function useNote(id: string): Note | null {
  return useSyncExternalStore(
    subscribe,
    () => readNote(id),
    getNoteServerSnapshot,
  );
}

const cardsByNoteCache = new WeakMap<Card[], Map<string, Card[]>>();

function readCardsForNote(noteId: string): Card[] {
  const all = readCards();
  let map = cardsByNoteCache.get(all);
  if (!map) {
    map = new Map();
    cardsByNoteCache.set(all, map);
  }
  let filtered = map.get(noteId);
  if (!filtered) {
    filtered = all.filter((c) => c.noteId === noteId);
    map.set(noteId, filtered);
  }
  return filtered;
}

export function useCards(noteId: string): Card[] {
  return useSyncExternalStore(
    subscribe,
    () => readCardsForNote(noteId),
    getCardsServerSnapshot,
  );
}

const subscribeNone = () => () => {};
export function useIsClient(): boolean {
  return useSyncExternalStore(
    subscribeNone,
    () => true,
    () => false,
  );
}

export function createNote(input: { title: string; body: string }): Note {
  const note: Note = {
    id: crypto.randomUUID(),
    title: input.title,
    body: input.body,
    createdAt: new Date().toISOString(),
  };
  writeNotes([...readNotes(), note]);
  return note;
}

const HARDCODED_CARDS: ReadonlyArray<{ front: string; back: string }> = [
  { front: "Sample front 1", back: "Sample back 1" },
  { front: "Sample front 2", back: "Sample back 2" },
  { front: "Sample front 3", back: "Sample back 3" },
];

export function generateCards(noteId: string): Card[] {
  const all = readCards();
  const others = all.filter((c) => c.noteId !== noteId);
  const now = new Date().toISOString();
  const fresh: Card[] = HARDCODED_CARDS.map((c) => ({
    id: crypto.randomUUID(),
    noteId,
    front: c.front,
    back: c.back,
    createdAt: now,
  }));
  writeCards([...others, ...fresh]);
  return fresh;
}
