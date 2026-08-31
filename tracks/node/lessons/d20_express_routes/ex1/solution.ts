// d20_express_routes / ex1 - one path, declared once, three verbs.
// See lessons/d20_express_routes/README.md, "Problem 1".
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
 * GET / PUT / DELETE on `/notes/:id`, declared with a single `app.route()`
 * chain. An unknown id is `404 { error: "not_found" }` on every verb.
 */
export function createApp(): Express {
  throw new Error("ex1: createApp() is not implemented yet - edit this file.");
}
