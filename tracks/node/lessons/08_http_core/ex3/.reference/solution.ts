// 08_http_core / ex3 - reference solution (author only, used by `dojo verify`).
import type { IncomingMessage, ServerResponse } from "node:http";

export type Handler = (req: IncomingMessage, res: ServerResponse) => void;

export const BODY_LIMIT = 1024;

export function sendJson(res: ServerResponse, status: number, body: unknown): void {
  const text = JSON.stringify(body);
  res.writeHead(status, {
    "content-type": "application/json",
    "content-length": Buffer.byteLength(text),
  });
  res.end(text);
}

export function createHandler(): Handler {
  let nextId = 1;

  return (req, res) => {
    const url = new URL(req.url ?? "/", "http://localhost");
    if (url.pathname !== "/orders") {
      sendJson(res, 404, { error: "not found" });
      return;
    }
    if (req.method !== "POST") {
      res.setHeader("allow", "POST");
      sendJson(res, 405, { error: "method not allowed" });
      return;
    }

    const chunks: Buffer[] = [];
    let size = 0;
    let tooLarge = false;

    req.on("data", (chunk: Buffer) => {
      size += chunk.length;
      if (size > BODY_LIMIT) {
        tooLarge = true;
        return; // stop accumulating: the bytes are read, but not kept
      }
      chunks.push(chunk);
    });

    req.on("end", () => {
      if (tooLarge) {
        sendJson(res, 413, { error: "payload too large" });
        return;
      }

      let parsed: { item?: string; qty?: number };
      try {
        parsed = JSON.parse(Buffer.concat(chunks).toString("utf8"));
      } catch {
        sendJson(res, 400, { error: "invalid json" });
        return;
      }

      const order = { id: nextId, item: parsed.item, qty: parsed.qty };
      nextId += 1;
      res.setHeader("location", `/orders/${order.id}`);
      sendJson(res, 201, order);
    });
  };
}
