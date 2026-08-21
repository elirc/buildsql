// 11_rest_capstone / ex4 - the whole API.
// See lessons/11_rest_capstone/README.md, "Exercise 4".
import express, { type Express } from "express";
import { z } from "zod";

export type TaskStatus = "todo" | "doing" | "done";

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
}

/** Provided: an error the client is allowed to be told about. */
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

/** Provided: the schemas and the seed data. */
export const statusSchema = z.enum(["todo", "doing", "done"]);

export const createTaskSchema = z.object({
  title: z.string().min(1),
  status: statusSchema.optional(),
});

export const patchTaskSchema = z.object({
  title: z.string().min(1).optional(),
  status: statusSchema.optional(),
});

export const SEED: Task[] = [
  { id: "seed-1", title: "write the readme", status: "done" },
  { id: "seed-2", title: "ship it", status: "todo" },
  { id: "seed-3", title: "review the pull request", status: "doing" },
];

export function createApp(): Express {
  throw new Error("ex4: createApp() is not implemented yet - edit this file.");
}
