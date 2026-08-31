// d19_http_routing / ex6 - mounting, without a framework to do it for you.
// See lessons/d19_http_routing/README.md, "Problem 6".
import type { IncomingMessage, ServerResponse } from "node:http";

export type Handler = (req: IncomingMessage, res: ServerResponse) => void;

/**
 * Wrap `handler` so it only sees requests under `prefix`, with the prefix taken
 * off `req.url` while it runs and put back afterwards. The untouched URL is
 * left on the request as `originalUrl`. Anything outside the prefix is a 404.
 */
export function mountAt(prefix: string, handler: Handler): Handler {
  throw new Error("ex6: mountAt() is not implemented yet - edit this file.");
}
