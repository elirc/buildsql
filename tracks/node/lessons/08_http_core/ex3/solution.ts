// 08_http_core / ex3 - reading a request body, safely.
// See lessons/08_http_core/README.md, "Exercise 3".
import type { IncomingMessage, ServerResponse } from "node:http";

export type Handler = (req: IncomingMessage, res: ServerResponse) => void;

/** The largest body this endpoint will accept, in bytes. */
export const BODY_LIMIT = 1024;

/** Provided: the JSON response helper from ex1. */
export function sendJson(res: ServerResponse, status: number, body: unknown): void {
  const text = JSON.stringify(body);
  res.writeHead(status, {
    "content-type": "application/json",
    "content-length": Buffer.byteLength(text),
  });
  res.end(text);
}

export function createHandler(): Handler {
  throw new Error("ex3: createHandler() is not implemented yet - edit this file.");
}
