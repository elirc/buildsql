// d19_http_routing / ex6 - reference solution (author only, used by `dojo verify`).
import type { IncomingMessage, ServerResponse } from "node:http";

export type Handler = (req: IncomingMessage, res: ServerResponse) => void;

type Mounted = IncomingMessage & { originalUrl?: string };

export function mountAt(prefix: string, handler: Handler): Handler {
  // Normalised once so the boundary test below is a single comparison.
  const base = prefix.endsWith("/") ? prefix.slice(0, -1) : prefix;

  return (req, res) => {
    const original = req.url ?? "/";
    const queryAt = original.indexOf("?");
    const pathname = queryAt === -1 ? original : original.slice(0, queryAt);
    const search = queryAt === -1 ? "" : original.slice(queryAt);

    const atMount = pathname === base || pathname === `${base}/`;
    // The trailing slash is what makes this a SEGMENT test: without it,
    // /api/v1extra starts with /api/v1 and gets mounted as "extra".
    const under = pathname.startsWith(`${base}/`);

    if (!atMount && !under) {
      const payload = JSON.stringify({ error: "not_found" });
      res.writeHead(404, {
        "content-type": "application/json; charset=utf-8",
        "content-length": Buffer.byteLength(payload),
      });
      res.end(payload);
      return;
    }

    const mounted = req as Mounted;
    // Only the outermost mount records it - a nested one would otherwise
    // overwrite it with the half-stripped path it was handed.
    if (mounted.originalUrl === undefined) mounted.originalUrl = original;

    // Nothing left means the root, because the empty string is not a path.
    req.url = `${atMount ? "/" : pathname.slice(base.length)}${search}`;
    try {
      handler(req, res);
    } finally {
      // The rewrite is a loan. Anything registered after this mount still
      // expects to see the URL the client sent.
      req.url = original;
    }
  };
}
