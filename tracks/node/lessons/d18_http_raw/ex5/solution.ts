// d18_http_raw / ex5 - moving a client without losing what it carried.
// See lessons/d18_http_raw/README.md, "Problem 5".
import type { IncomingMessage, ServerResponse } from "node:http";

export type Handler = (req: IncomingMessage, res: ServerResponse) => void;

/**
 * `/old-report` moved permanently, `/reports/quarterly/` is the uncanonical
 * spelling, `/latest` is a temporary alias, and `/reports/quarterly` is the
 * real thing. Query strings survive every hop; the canonical URL never
 * redirects to itself.
 */
export function createHandler(): Handler {
  throw new Error("ex5: createHandler() is not implemented yet - edit this file.");
}
