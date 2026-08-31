// d18_http_raw / ex4 - reference solution (author only, used by `dojo verify`).
import type { IncomingMessage, ServerResponse } from "node:http";

export type Handler = (req: IncomingMessage, res: ServerResponse) => void;

const CLIP = Buffer.from("0123456789", "utf8");

type RangeResult =
  | { kind: "none" }
  | { kind: "unsatisfiable" }
  | { kind: "range"; start: number; end: number };

function parseRange(header: string | undefined, size: number): RangeResult {
  if (header === undefined) return { kind: "none" };

  const spec = header.trim();
  // A unit you do not understand is ignored, not refused.
  if (!spec.toLowerCase().startsWith("bytes=")) return { kind: "none" };

  const value = spec.slice("bytes=".length);
  // Multiple ranges would need a multipart body; serving the whole thing is a
  // legal answer and a much smaller one to write.
  if (value.includes(",")) return { kind: "none" };

  const [rawStart, rawEnd] = value.split("-");
  if (rawEnd === undefined) return { kind: "none" };

  if (rawStart.trim() === "") {
    // "-N" is a SUFFIX: the last N bytes, not the first N.
    const suffix = Number(rawEnd);
    if (!Number.isInteger(suffix) || suffix <= 0) return { kind: "unsatisfiable" };
    return { kind: "range", start: Math.max(0, size - suffix), end: size - 1 };
  }

  const start = Number(rawStart);
  if (!Number.isInteger(start) || start < 0 || start >= size) return { kind: "unsatisfiable" };

  if (rawEnd.trim() === "") return { kind: "range", start, end: size - 1 };

  const requested = Number(rawEnd);
  if (!Number.isInteger(requested) || requested < start) return { kind: "unsatisfiable" };
  // An end past the last byte is clamped: the client asked for more than there
  // is and gets what there is.
  return { kind: "range", start, end: Math.min(requested, size - 1) };
}

export function createHandler(): Handler {
  return (req, res) => {
    const url = new URL(req.url ?? "/", "http://localhost");
    if (url.pathname !== "/clip.txt") {
      const payload = JSON.stringify({ error: "not_found" });
      res.writeHead(404, {
        "content-type": "application/json; charset=utf-8",
        "content-length": Buffer.byteLength(payload),
      });
      res.end(payload);
      return;
    }

    const size = CLIP.length;
    const range = parseRange(req.headers.range, size);

    if (range.kind === "unsatisfiable") {
      res.writeHead(416, {
        "content-range": `bytes */${size}`,
        "accept-ranges": "bytes",
      });
      res.end();
      return;
    }

    if (range.kind === "none") {
      res.writeHead(200, {
        "content-type": "text/plain; charset=utf-8",
        "content-length": size,
        "accept-ranges": "bytes",
      });
      res.end(CLIP);
      return;
    }

    const slice = CLIP.subarray(range.start, range.end + 1);
    res.writeHead(206, {
      "content-type": "text/plain; charset=utf-8",
      "content-length": slice.length,
      "accept-ranges": "bytes",
      // Both ends are INCLUSIVE, and the total is the whole resource.
      "content-range": `bytes ${range.start}-${range.end}/${size}`,
    });
    res.end(slice);
  };
}
