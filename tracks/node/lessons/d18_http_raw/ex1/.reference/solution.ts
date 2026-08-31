// d18_http_raw / ex1 - reference solution (author only, used by `dojo verify`).
import type { IncomingMessage, ServerResponse } from "node:http";

export type Handler = (req: IncomingMessage, res: ServerResponse) => void;

const REPORT = { id: "r-1", title: "Quarterly report", total: 42 };

//: server preference order - the tie-break when the client has no opinion
const OFFERED = ["application/json", "text/plain"] as const;

interface Preference {
  type: string;
  quality: number;
}

function parseAccept(header: string | undefined): Preference[] {
  if (header === undefined || header.trim() === "") return [{ type: "*/*", quality: 1 }];

  return header.split(",").map((entry) => {
    const [type, ...parameters] = entry.trim().split(";");
    let quality = 1;
    for (const parameter of parameters) {
      const [key, value] = parameter.trim().split("=");
      if (key !== "q") continue;
      const parsed = Number(value);
      if (!Number.isNaN(parsed)) quality = parsed;
    }
    return { type: type.trim().toLowerCase(), quality };
  });
}

/** The best q the client gave this offer, or -1 if it never mentioned it. */
function qualityOf(offer: string, preferences: Preference[]): number {
  const [group] = offer.split("/");
  let best = -1;
  for (const preference of preferences) {
    const matches =
      preference.type === offer || preference.type === `${group}/*` || preference.type === "*/*";
    if (matches && preference.quality > best) best = preference.quality;
  }
  return best;
}

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
    // The response depends on a request header, so every cache in the world
    // needs to be told which one.
    res.setHeader("vary", "Accept");

    if (url.pathname !== "/report") {
      sendJson(res, 404, { error: "not_found" });
      return;
    }

    const preferences = parseAccept(req.headers.accept);
    let chosen: string | null = null;
    // Starting at 0 rather than -1 is what makes q=0 a refusal.
    let best = 0;
    for (const offer of OFFERED) {
      const quality = qualityOf(offer, preferences);
      // Strictly greater, so a tie leaves the earlier (preferred) offer in place.
      if (quality > best) {
        best = quality;
        chosen = offer;
      }
    }

    if (chosen === null) {
      sendJson(res, 406, { error: "not_acceptable", offered: [...OFFERED] });
      return;
    }

    if (chosen === "application/json") {
      sendJson(res, 200, REPORT);
      return;
    }

    const text = `${REPORT.id} ${REPORT.title} ${REPORT.total}`;
    res.writeHead(200, {
      "content-type": "text/plain; charset=utf-8",
      "content-length": Buffer.byteLength(text),
    });
    res.end(text);
  };
}
