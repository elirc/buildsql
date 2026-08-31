// d18_http_raw / ex1 - the same resource, in the type the client can read.
// See lessons/d18_http_raw/README.md, "Problem 1".
import type { IncomingMessage, ServerResponse } from "node:http";

export type Handler = (req: IncomingMessage, res: ServerResponse) => void;

/**
 * `GET /report` as `application/json` or `text/plain`, chosen from the Accept
 * header. Every response carries `Vary: Accept`; nothing acceptable is a 406.
 */
export function createHandler(): Handler {
  throw new Error("ex1: createHandler() is not implemented yet - edit this file.");
}
