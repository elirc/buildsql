// d24_mixed_gauntlet / ex8 - the whole stack, in one small app.
// See lessons/d24_mixed_gauntlet/README.md, "Problem 8".
import type { Express } from "express";

export interface Order {
  id: string;
  item: string;
  amount: number;
}

export interface GatewayDeps {
  /** Requests must present this in x-api-key. */
  apiKey: string;
  upstream: { listOrders: () => Promise<Order[]> };
  /** Called with the real error when something unexpected happens. */
  logError: (error: unknown) => void;
}

/**
 * A guard, a router mounted at /api/v1 with a collection, an NDJSON export and
 * a lookup, and one error handler that turns an upstream failure into a 502
 * without telling the client anything useful to an attacker.
 */
export function createApp(deps: GatewayDeps): Express {
  throw new Error("ex8: createApp() is not implemented yet - edit this file.");
}
