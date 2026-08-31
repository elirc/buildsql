// d18_http_raw / ex2 - a GET with the body left off.
// See lessons/d18_http_raw/README.md, "Problem 2".
import type { IncomingMessage, ServerResponse } from "node:http";

export type Handler = (req: IncomingMessage, res: ServerResponse) => void;

/**
 * `GET /status` answers a JSON document; `HEAD /status` answers the same status
 * and the same headers - including an accurate `content-length` - and no body.
 * Anything else is a 404, on both methods.
 */
export function createHandler(): Handler {
  throw new Error("ex2: createHandler() is not implemented yet - edit this file.");
}
