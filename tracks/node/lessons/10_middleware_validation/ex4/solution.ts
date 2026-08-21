// 10_middleware_validation / ex4 - async handlers that fail.
// See lessons/10_middleware_validation/README.md, "Exercise 4".
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

/** Provided: the dependency that is having a bad day. */
export async function fetchPrices(): Promise<never> {
  throw new AppError(503, "upstream_unavailable", "the pricing service is down");
}

/** Provided: the error handler you wrote in ex3. */
export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (error instanceof AppError) {
    res.status(error.status).json({ error: error.code, message: error.message });
    return;
  }
  res.status(500).json({ error: "internal_error", message: "internal server error" });
}

export function createApp(): Express {
  throw new Error("ex4: createApp() is not implemented yet - edit this file.");
}
