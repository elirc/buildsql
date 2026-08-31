// d24_mixed_gauntlet / ex8 - reference solution (author only, used by `dojo verify`).
import { pipeline } from "node:stream/promises";
import express, { Router, type Express, type NextFunction, type Request, type Response } from "express";

export interface Order {
  id: string;
  item: string;
  amount: number;
}

export interface GatewayDeps {
  apiKey: string;
  upstream: { listOrders: () => Promise<Order[]> };
  logError: (error: unknown) => void;
}

class UpstreamError extends Error {
  constructor(cause: unknown) {
    super("upstream failed", { cause });
    this.name = "UpstreamError";
  }
}

export function createApp(deps: GatewayDeps): Express {
  const app = express();

  app.use((req, res, next) => {
    if (req.get("x-api-key") !== deps.apiKey) {
      res.status(401).json({ error: "unauthorized" });
      return;
    }
    next();
  });

  const api = Router();

  const load = async (): Promise<Order[]> => {
    try {
      return await deps.upstream.listOrders();
    } catch (error) {
      throw new UpstreamError(error);
    }
  };

  api.get("/orders", async (_req, res) => {
    const orders = await load();
    res.json({ items: orders, total: orders.length });
  });

  // Registered BEFORE /orders/:id, or "export" is just another order id.
  api.get("/orders/export", async (_req, res) => {
    const orders = await load();
    res.setHeader("content-type", "application/x-ndjson");
    await pipeline(
      (async function* () {
        for (const order of orders) yield `${JSON.stringify(order)}\n`;
      })(),
      res,
    );
  });

  api.get("/orders/:id", async (req, res) => {
    const orders = await load();
    const order = orders.find((candidate) => candidate.id === req.params.id);
    if (order === undefined) {
      res.status(404).json({ error: "not_found" });
      return;
    }
    res.json(order);
  });

  app.use("/api/v1", api);

  app.use((_req, res) => {
    res.status(404).json({ error: "not_found" });
  });

  // Four arguments: this is the error handler, and it is the only place a
  // status is chosen for a failure.
  app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
    deps.logError(error);
    if (error instanceof UpstreamError) {
      res.status(502).json({ error: "upstream_failed" });
      return;
    }
    res.status(500).json({ error: "internal_error" });
  });

  return app;
}
