// 09_express_fundamentals / ex2 - reference solution (author only, used by `dojo verify`).
import express, { type Express } from "express";

export const ORDERS = [
  { id: "1", item: "keyboard", amount: 80, status: "paid" },
  { id: "2", item: "monitor", amount: 240, status: "pending" },
  { id: "3", item: "desk", amount: 410, status: "paid" },
];

export function createApp(): Express {
  const app = express();

  app.get("/orders", (req, res) => {
    const raw = req.query.limit;
    if (raw === undefined) {
      res.json(ORDERS);
      return;
    }

    const limit = Number(raw);
    if (!Number.isInteger(limit) || limit < 1) {
      res.status(400).json({ error: "limit must be a positive number" });
      return;
    }
    res.json(ORDERS.slice(0, limit));
  });

  app.get("/orders/:id", (req, res) => {
    const order = ORDERS.find((candidate) => candidate.id === req.params.id);
    if (order === undefined) {
      res.status(404).json({ error: "not found" });
      return;
    }
    res.json(order);
  });

  return app;
}
