// d18_http_raw / ex5 - reference solution (author only, used by `dojo verify`).
import type { IncomingMessage, ServerResponse } from "node:http";

export type Handler = (req: IncomingMessage, res: ServerResponse) => void;

const CANONICAL = "/reports/quarterly";

function sendJson(res: ServerResponse, status: number, body: unknown): void {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "content-length": Buffer.byteLength(payload),
  });
  res.end(payload);
}

export function createHandler(): Handler {
  return (req, res) => {
    const url = new URL(req.url ?? "/", "http://localhost");

    /** The canonical location, carrying this request's query string. */
    const to = (): string => {
      // Built with URL rather than by concatenation, so a target that already
      // had a query, or a stray slash, cannot produce a broken Location.
      const target = new URL(CANONICAL, "http://localhost");
      target.search = url.search;
      return `${target.pathname}${target.search}`;
    };

    const redirect = (status: number): void => {
      res.writeHead(status, { location: to(), "content-length": 0 });
      res.end();
    };

    switch (url.pathname) {
      case "/old-report":
        // Permanent: caches and browsers may remember this forever.
        redirect(301);
        return;
      case `${CANONICAL}/`:
        // Permanent AND method-preserving, which 301 does not promise.
        redirect(308);
        return;
      case "/latest":
        // A pointer that will mean something else next quarter, so temporary.
        redirect(302);
        return;
      case CANONICAL:
        sendJson(res, 200, { id: "quarterly", year: url.searchParams.get("year") });
        return;
      default:
        sendJson(res, 404, { error: "not_found" });
    }
  };
}
