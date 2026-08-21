// 09_express_fundamentals / ex4 - reference solution (author only, used by `dojo verify`).
import express, { type Express } from "express";

export const ORDERS = [
  { id: "1", item: "keyboard", amount: 80, status: "paid" },
  { id: "2", item: "monitor", amount: 240, status: "pending" },
];

export function createApp(): Express {
  const app = express();

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  const orders = express.Router();

  orders.use((_req, res, next) => {
    res.setHeader("x-api-version", "v1");
    next();
  });

  orders.get("/orders", (_req, res) => {
    res.json(ORDERS);
  });

  orders.get("/orders/:id", (req, res) => {
    const order = ORDERS.find((candidate) => candidate.id === req.params.id);
    if (order === undefined) {
      res.status(404).json({ error: "not found" });
      return;
    }
    res.json(order);
  });

  app.use("/api/v1", orders);

  return app;
}
