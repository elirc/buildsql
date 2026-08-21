// 08_http_core / ex2 - the query string.
// See lessons/08_http_core/README.md, "Exercise 2".
import type { IncomingMessage, ServerResponse } from "node:http";

export type Handler = (req: IncomingMessage, res: ServerResponse) => void;

/** Provided: the JSON response helper you wrote in ex1. */
export function sendJson(res: ServerResponse, status: number, body: unknown): void {
  const text = JSON.stringify(body);
  res.writeHead(status, {
    "content-type": "application/json",
    "content-length": Buffer.byteLength(text),
  });
  res.end(text);
}

export function createHandler(): Handler {
  throw new Error("ex2: createHandler() is not implemented yet - edit this file.");
}
