// d18_http_raw / ex8 - reference solution (author only, used by `dojo verify`).
import type { IncomingMessage, ServerResponse } from "node:http";

export type Handler = (req: IncomingMessage, res: ServerResponse) => void;

export interface SseEvent {
  id?: string;
  event?: string;
  data: string;
}

/** One event, as the bytes that go on the wire. */
function frame(event: SseEvent): string {
  const lines: string[] = [];
  if (event.id !== undefined) lines.push(`id: ${event.id}`);
  if (event.event !== undefined) lines.push(`event: ${event.event}`);
  // A newline inside the payload is not allowed to be a newline on the wire:
  // it would end the event early. Each line gets its own data: field.
  for (const line of event.data.split("\n")) lines.push(`data: ${line}`);
  // The trailing blank line is what dispatches the event.
  return `${lines.join("\n")}\n\n`;
}

export function createEventStream(source: AsyncIterable<SseEvent>): Handler {
  return (req, res) => {
    const url = new URL(req.url ?? "/", "http://localhost");
    if (url.pathname !== "/events") {
      const payload = JSON.stringify({ error: "not_found" });
      res.writeHead(404, {
        "content-type": "application/json; charset=utf-8",
        "content-length": Buffer.byteLength(payload),
      });
      res.end(payload);
      return;
    }

    // No content-length: the length is not knowable, so the response is
    // chunked and every write goes out as its own chunk.
    res.writeHead(200, {
      "content-type": "text/event-stream",
      "cache-control": "no-cache",
    });

    void (async () => {
      try {
        for await (const event of source) res.write(frame(event));
      } catch (error) {
        // The headers went out with the first event, so a 500 is no longer
        // available. Say so in the stream instead.
        const message = error instanceof Error ? error.message : String(error);
        res.write(frame({ event: "error", data: message }));
      } finally {
        // Always end: a client left hanging reconnects and fails again.
        res.end();
      }
    })();
  };
}
