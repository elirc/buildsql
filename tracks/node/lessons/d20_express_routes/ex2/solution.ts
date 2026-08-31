// d20_express_routes / ex2 - load it once, before anybody asks.
// See lessons/d20_express_routes/README.md, "Problem 2".
import { type Express } from "express";

export interface Note {
  id: string;
  title: string;
}

export const SEED: Note[] = [
  { id: "n1", title: "buy milk" },
  { id: "n2", title: "call ada" },
];

/**
 * An app whose `:id` routes never look a note up: an `app.param("id", ...)`
 * callback does it once per request, 404s centrally when there is no such note,
 * and hangs the result on the request. `/stats` reports how many lookups have
 * happened; `/health` and `/stats` must never cause one.
 */
export function createApp(): Express {
  throw new Error("ex2: createApp() is not implemented yet - edit this file.");
}
