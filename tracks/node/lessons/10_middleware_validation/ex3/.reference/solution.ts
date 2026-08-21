// 10_middleware_validation / ex3 - reference solution (author only, used by `dojo verify`).
import express, {
  type Express,
  type NextFunction,
  type Request,
  type Response,
} from "express";

export class AppError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export const ORDERS = [
  { id: "1", item: "keyboard" },
  { id: "2", item: "monitor" },
];

export function createApp(logError: (error: unknown) => void = () => {}): Express {
  const app = express();

  app.get("/orders/:id", (req, res) => {
    const order = ORDERS.find((candidate) => candidate.id === req.params.id);
    if (order === undefined) throw new AppError(404, "not_found", "no such order");
    res.json(order);
  });

  app.get("/boom", () => {
    throw new Error("query failed on postgres://app:hunter2@db:5432/orders");
  });

  // Nothing matched: still an error, so it goes through the same funnel.
  app.use((_req, _res, next: NextFunction) => {
    next(new AppError(404, "not_found", "no such route"));
  });

  // Four parameters is what makes express treat this as an error handler.
  app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (error instanceof AppError) {
      res.status(error.status).json({ error: error.code, message: error.message });
      return;
    }
    logError(error);
    res.status(500).json({ error: "internal_error", message: "internal server error" });
  });

  return app;
}
