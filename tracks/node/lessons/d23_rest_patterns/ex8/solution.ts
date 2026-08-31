// d23_rest_patterns / ex8 - the whole small service.
// See lessons/d23_rest_patterns/README.md, "Problem 8".
import { type Express } from "express";

export interface Subtask {
  id: string;
  title: string;
  done: boolean;
}

export interface Task {
  id: string;
  title: string;
  status: "open" | "done";
  subtasks: Subtask[];
}

export interface Deps {
  /** Overrides the built-in seed, so a caller can start from known data. */
  seed?: Task[];
}

/**
 * A task service with cursor pagination, sparse fieldsets, problem+json errors
 * and one business rule: a task cannot be done while a subtask is open.
 */
export function createApp(deps: Deps = {}): Express {
  throw new Error("ex8: createApp() is not implemented yet - edit this file.");
}
