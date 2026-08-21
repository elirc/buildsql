// 09_express_fundamentals / challenge - reference solution (author only, used by `dojo verify`).
import express, { type Express } from "express";

export const ORDERS = [
  { id: "1", item: "keyboard", amount: 80, status: "paid" },
  { id: "2", item: "monitor", amount: 240, status: "pending" },
  { id: "3", item: "desk", amount: 410, status: "paid" },
  { id: "4", item: "mouse", amount: 25, status: "paid" },
  { id: "5", item: "chair", amount: 150, status: "cancelled" },
];

const SORTS = new Set(["id", "amount"]);
const ORDERS_DIRECTIONS = new Set(["asc", "desc"]);

const asString = (value: unknown, fallback: string): string =>
  typeof value === "string" ? value : fallback;

export function createApp(): Express {
  const app = express();

  app.get("/orders", (req, res) => {
    const sort = asString(req.query.sort, "id");
    if (!SORTS.has(sort)) {
      res.status(400).json({ error: "invalid sort" });
      return;
    }

    const direction = asString(req.query.order, "asc");
    if (!ORDERS_DIRECTIONS.has(direction)) {
      res.status(400).json({ error: "invalid order" });
      return;
    }

    const page = Number(asString(req.query.page, "1"));
    const perPage = Number(asString(req.query.perPage, "10"));
    if (
      !Number.isInteger(page) || page < 1 ||
      !Number.isInteger(perPage) || perPage < 1 || perPage > 50
    ) {
      res.status(400).json({ error: "invalid pagination" });
      return;
    }

    const status = req.query.status;
    const filtered = typeof status === "string"
      ? ORDERS.filter((order) => order.status === status)
      : [...ORDERS];

    const sorted = filtered.sort((a, b) => {
      const comparison = sort === "amount"
        ? a.amount - b.amount
        : a.id.localeCompare(b.id);
      return direction === "desc" ? -comparison : comparison;
    });

    const start = (page - 1) * perPage;
    res.json({
      items: sorted.slice(start, start + perPage),
      page,
      perPage,
      total: filtered.length,
    });
  });

  return app;
}
