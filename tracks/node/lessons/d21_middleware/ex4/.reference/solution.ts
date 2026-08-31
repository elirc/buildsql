// d21_middleware / ex4 - reference solution (author only, used by `dojo verify`).
import express, { type ErrorRequestHandler, type Express } from "express";

export interface ErrorAppHooks {
  log: (message: string) => void;
}

/** An error this API knows how to explain to a client. */
class KnownProblem extends Error {
  readonly status = 422;
  readonly code = "unprocessable";
}

export const finalErrorHandler: ErrorRequestHandler = (error, _req, res, next) => {
  // Nothing can be changed about a response that has already begun, so the
  // only honest move is to hand it back to express, which will destroy the
  // connection rather than send a second answer.
  if (res.headersSent) {
    next(error);
    return;
  }

  const hooks = res.locals.hooks as ErrorAppHooks | undefined;
  hooks?.log(`boom: ${(error as Error).message}`);

  res.status(500).json({
    error: "internal_error",
    message: "internal server error",
    touched: res.locals.touched === true,
  });
};

export function createApp(hooks: ErrorAppHooks): Express {
  const app = express();

  app.use((_req, res, next) => {
    // The final handler is a module-level constant, so it is handed its
    // collaborators through the response rather than through a closure.
    res.locals.hooks = hooks;
    next();
  });

  app.get("/ok", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.get("/known", () => {
    throw new KnownProblem("known problem");
  });

  app.get("/unknown", () => {
    throw new Error("the database is on fire");
  });

  // First error handler: recognises its own errors, passes on everything else.
  app.use(((error, _req, res, next) => {
    if (error instanceof KnownProblem) {
      res.status(error.status).json({ error: error.code, message: error.message });
      return;
    }
    next(error);
  }) as ErrorRequestHandler);

  // Ordinary middleware. On the normal path it runs; in the error path express
  // skips it, because it takes three arguments and not four.
  app.use((_req, res, next) => {
    res.locals.touched = true;
    res.setHeader("x-marker", "ran");
    next();
  });

  app.use(finalErrorHandler);

  return app;
}
