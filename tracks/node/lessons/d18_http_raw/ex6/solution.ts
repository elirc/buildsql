// d18_http_raw / ex6 - the write that refuses to lose somebody else's update.
// See lessons/d18_http_raw/README.md, "Problem 6".
import type { IncomingMessage, ServerResponse } from "node:http";

export type Handler = (req: IncomingMessage, res: ServerResponse) => void;

/**
 * `GET /config` returns the value and its ETag. `PUT /config` requires an
 * `If-Match`: a matching one (or `*`) writes and issues a new ETag, a stale one
 * is 412 and changes nothing, and a missing one is 428.
 */
export function createHandler(): Handler {
  throw new Error("ex6: createHandler() is not implemented yet - edit this file.");
}
