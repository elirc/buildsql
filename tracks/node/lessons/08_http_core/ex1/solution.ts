// 08_http_core / ex1 - routing by hand.
// See lessons/08_http_core/README.md, "Exercise 1".
import type { IncomingMessage, ServerResponse } from "node:http";

export type Handler = (req: IncomingMessage, res: ServerResponse) => void;

/** The data this handler serves. Do not change it. */
const ORDERS = [
  { id: "1", item: "keyboard" },
  { id: "2", item: "monitor" },
];

export function createHandler(): Handler {
  throw new Error("ex1: createHandler() is not implemented yet - edit this file.");
}
