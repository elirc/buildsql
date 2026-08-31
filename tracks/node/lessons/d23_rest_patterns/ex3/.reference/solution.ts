// d23_rest_patterns / ex3 - reference solution (author only, used by `dojo verify`).
import express, { type Express } from "express";

export interface Problem {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
}

export interface ProblemInput {
  type?: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
}

export function problem(input: ProblemInput): Problem {
  return {
    // about:blank is what RFC 9457 says to use when the status code is the
    // whole story - it is not a placeholder for a missing value.
    type: input.type ?? "about:blank",
    title: input.title,
    status: input.status,
    detail: input.detail,
    instance: input.instance,
  };
}

/** A failure the API meant to produce, carrying its own problem document. */
export class ProblemError extends Error {
  constructor(readonly problem: Problem) {
    super(problem.detail);
    this.name = "ProblemError";
  }
}

interface Task {
  id: string;
  title: string;
  archived: boolean;
}

export function createApp(logError: (error: unknown) => void = () => {}): Express {
  const app = express();
  app.use(express.json());

  const tasks: Task[] = [{ id: "seed-1", title: "write the spec", archived: true }];

  app.get("/tasks", (req, res) => {
    const status = req.query.status;
    if (status !== undefined && status !== "open" && status !== "done") {
      throw new ProblemError(
        problem({
          title: "Bad Request",
          status: 400,
          detail: "status must be one of open, done",
          instance: req.originalUrl,
        }),
      );
    }
    res.json({ items: tasks });
  });

  app.get("/tasks/:id", (req, res) => {
    const task = tasks.find((candidate) => candidate.id === req.params.id);
    if (task === undefined) {
      throw new ProblemError(
        problem({
          title: "Not Found",
          status: 404,
          detail: `no task with id ${req.params.id}`,
          instance: req.originalUrl,
        }),
      );
    }
    res.json(task);
  });

  app.post("/tasks/:id/archive", (req, res) => {
    const task = tasks.find((candidate) => candidate.id === req.params.id);
    if (task !== undefined && task.archived) {
      throw new ProblemError(
        problem({
          // A type of its own, because a client wants to branch on this one
          // rather than match the title with a regular expression.
          type: "https://example.com/probs/already-archived",
          title: "Conflict",
          status: 409,
          detail: `task ${req.params.id} is already archived`,
          instance: req.originalUrl,
        }),
      );
    }
    if (task === undefined) {
      throw new ProblemError(
        problem({
          title: "Not Found",
          status: 404,
          detail: `no task with id ${req.params.id}`,
          instance: req.originalUrl,
        }),
      );
    }

    task.archived = true;
    res.json(task);
  });

  app.get("/boom", (_req, _res) => {
    throw new Error("connect ECONNREFUSED postgres://api:hunter2@db.internal:5432");
  });

  // One handler at the bottom, and the only place a status code is turned into
  // a response body.
  app.use((error: unknown, req: express.Request, res: express.Response, _next: express.NextFunction) => {
    if (error instanceof ProblemError) {
      res.status(error.problem.status).type("application/problem+json").json(error.problem);
      return;
    }

    // Unexpected: the client is told nothing, the log is told everything.
    logError(error);
    res
      .status(500)
      .type("application/problem+json")
      .json(
        problem({
          title: "Internal Server Error",
          status: 500,
          detail: "an unexpected error occurred",
          instance: req.originalUrl,
        }),
      );
  });

  return app;
}
