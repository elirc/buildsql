// d23_rest_patterns / ex4 - pages that do not slip.
// See lessons/d23_rest_patterns/README.md, "Problem 4".
import { type Express } from "express";

/**
 * GET /tasks?limit=&cursor= - answers `{ items, nextCursor }`, where the cursor
 * is an opaque base64url string and the last page carries `null`.
 */
export function createApp(): Express {
  throw new Error("ex4: createApp() is not implemented yet - edit this file.");
}
