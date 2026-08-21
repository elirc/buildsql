// 09_express_fundamentals / ex1 - reference solution (author only, used by `dojo verify`).
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

  app.get("/orders", (_req, res) => {
    res.json(ORDERS);
  });

  return app;
}
