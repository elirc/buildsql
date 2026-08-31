// d20_express_routes / ex8 - the status code express will not give you.
// See lessons/d20_express_routes/README.md, "Problem 8".
import { type Express } from "express";

export interface Note {
  id: string;
  title: string;
}

export const SEED: Note[] = [{ id: "n1", title: "buy milk" }];

/**
 * An app serving `GET|POST /notes`, `GET|PATCH|DELETE /notes/:id` and
 * `GET /health`, which answers 405 with a correct `Allow` header when a known
 * path is asked for with a method it does not have, 204 with `Allow` for
 * OPTIONS, and 404 for a path it does not know at all.
 */
export function createApp(): Express {
  throw new Error("ex8: createApp() is not implemented yet - edit this file.");
}
