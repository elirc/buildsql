// d18_http_raw / ex3 - cookies, before a library hid them from you.
// See lessons/d18_http_raw/README.md, "Problem 3".
import type { IncomingMessage, ServerResponse } from "node:http";

export type Handler = (req: IncomingMessage, res: ServerResponse) => void;

/**
 * `GET /session` reports the cookies the request carried, as an object.
 * `POST /session` sets a session cookie and a preference cookie on the one
 * response. Session ids are handed out in order, starting at `s-1`.
 */
export function createHandler(): Handler {
  throw new Error("ex3: createHandler() is not implemented yet - edit this file.");
}
