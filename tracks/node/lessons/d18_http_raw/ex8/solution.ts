// d18_http_raw / ex8 - a response that is still being written.
// See lessons/d18_http_raw/README.md, "Problem 8".
import type { IncomingMessage, ServerResponse } from "node:http";

export type Handler = (req: IncomingMessage, res: ServerResponse) => void;

export interface SseEvent {
  /** Optional event id, sent as an `id:` line. */
  id?: string;
  /** Optional event name, sent as an `event:` line. */
  event?: string;
  /** The payload. Every line of it becomes its own `data:` line. */
  data: string;
}

/**
 * `GET /events` streams `source` as server-sent events and ends when the source
 * does. A source that throws reports the failure as an `error` event, because
 * the status code has already left the building.
 */
export function createEventStream(source: AsyncIterable<SseEvent>): Handler {
  throw new Error("ex8: createEventStream() is not implemented yet - edit this file.");
}
