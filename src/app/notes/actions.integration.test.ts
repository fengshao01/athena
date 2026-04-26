import { eq } from "drizzle-orm";
import { migrate } from "drizzle-orm/neon-http/migrator";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { db } from "../../db";
import { notes } from "../../db/schema";
import { createNote, getNote } from "./actions";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const createdIds: string[] = [];

beforeAll(async () => {
  // Drizzle's migration journal makes this idempotent — already-applied
  // migrations are skipped on subsequent runs.
  await migrate(db, { migrationsFolder: "./drizzle" });
});

afterEach(async () => {
  if (createdIds.length === 0) return;
  for (const id of createdIds) {
    await db.delete(notes).where(eq(notes.id, id));
  }
  createdIds.length = 0;
});

afterAll(async () => {
  // No-op. neon-http is fetch-based (no connection pool to close), and the
  // Neon branch persists across runs by design — dropping the schema here
  // would just force the next run to re-migrate.
});

describe("createNote (integration)", () => {
  it("inserts a note and returns a row with all expected fields", async () => {
    const before = Date.now();
    const note = await createNote({
      title: "Integration test note",
      body: "Some body content.",
    });
    createdIds.push(note.id);

    expect(note.id).toMatch(UUID_RE);
    expect(note.title).toBe("Integration test note");
    expect(note.body).toBe("Some body content.");
    expect(note.createdAt).toBeInstanceOf(Date);
    expect(note.updatedAt).toBeInstanceOf(Date);
    expect(note.createdAt.getTime()).toBeGreaterThanOrEqual(before - 5_000);
    expect(note.createdAt.getTime()).toBeLessThanOrEqual(Date.now() + 5_000);
  });

  it("round-trips: getNote returns the same row that createNote returned", async () => {
    const note = await createNote({
      title: "Round trip",
      body: "Body line 1\nBody line 2",
    });
    createdIds.push(note.id);

    const fetched = await getNote(note.id);
    expect(fetched).not.toBeNull();
    expect(fetched).toEqual(note);
  });

  it("preserves Cyrillic and emoji characters exactly", async () => {
    const title = "Привет 👋";
    const body = "Тест эмодзи 🎉";
    const note = await createNote({ title, body });
    createdIds.push(note.id);

    expect(note.title).toBe(title);
    expect(note.body).toBe(body);

    const fetched = await getNote(note.id);
    expect(fetched?.title).toBe(title);
    expect(fetched?.body).toBe(body);
  });

  it("preserves an empty body string as '' rather than null", async () => {
    const note = await createNote({ title: "Empty body", body: "" });
    createdIds.push(note.id);

    expect(note.body).toBe("");

    const fetched = await getNote(note.id);
    expect(fetched?.body).toBe("");
  });
});
