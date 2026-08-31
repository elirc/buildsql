// d23_rest_patterns / ex4 - reference solution (author only, used by `dojo verify`).
import express, { type Express } from "express";

export interface Task {
  id: string;
  title: string;
}

export const DEFAULT_LIMIT = 2;
export const MAX_LIMIT = 3;

const SEED: Task[] = [
  { id: "t-1", title: "write the spec" },
  { id: "t-2", title: "review the pull request" },
  { id: "t-3", title: "draw the diagram" },
  { id: "t-4", title: "record the demo" },
  { id: "t-5", title: "book the room" },
];

/** The cursor is the id of the last row served, and nothing else. */
const encodeCursor = (id: string): string => Buffer.from(id, "utf8").toString("base64url");
const decodeCursor = (cursor: string): string => Buffer.from(cursor, "base64url").toString("utf8");

function limitFrom(raw: unknown): number {
  const parsed = Number(raw);
  if (!Number.isInteger(parsed) || parsed < 1) return DEFAULT_LIMIT;
  // Capped, not obeyed: one client must not be able to ask for everything.
  return Math.min(parsed, MAX_LIMIT);
}

export function createApp(): Express {
  const app = express();
  // Sorted once, and the sort is part of the contract - a cursor only means
  // anything relative to a stable order.
  const tasks = [...SEED].sort((a, b) => a.id.localeCompare(b.id));

  app.get("/tasks", (req, res) => {
    const limit = limitFrom(req.query.limit);

    let start = 0;
    if (typeof req.query.cursor === "string" && req.query.cursor !== "") {
      const after = decodeCursor(req.query.cursor);
      const index = tasks.findIndex((task) => task.id === after);
      if (index === -1) {
        // Decoding cannot fail usefully - base64url of anything is bytes. What
        // makes a cursor valid is that it names a row this collection has.
        res.status(400).json({ error: "invalid_cursor" });
        return;
      }
      start = index + 1;
    }

    const items = tasks.slice(start, start + limit);
    const last = items[items.length - 1];
    const more = last !== undefined && start + items.length < tasks.length;

    res.json({ items, nextCursor: more ? encodeCursor(last.id) : null });
  });

  return app;
}
