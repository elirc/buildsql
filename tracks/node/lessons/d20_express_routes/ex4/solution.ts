// d20_express_routes / ex4 - the handler that decides it is not the one.
// See lessons/d20_express_routes/README.md, "Problem 4".
import { type Express } from "express";

/**
 * Two routes on the same path, `/reports/:id`. The first begins with a guard
 * that keeps numeric ids and hands everything else to the **next route**; the
 * second answers those. Every response carries the trail of what ran.
 */
export function createApp(): Express {
  throw new Error("ex4: createApp() is not implemented yet - edit this file.");
}
