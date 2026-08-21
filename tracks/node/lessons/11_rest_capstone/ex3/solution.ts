// 11_rest_capstone / ex3 - the write endpoints.
// See lessons/11_rest_capstone/README.md, "Exercise 3".
import express, { type Express } from "express";
import { z } from "zod";

export type TaskStatus = "todo" | "doing" | "done";

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
}

/** Provided: the schemas for the two write endpoints. */
export const statusSchema = z.enum(["todo", "doing", "done"]);

export const createTaskSchema = z.object({
  title: z.string().min(1),
  status: statusSchema.optional(),
});

export const patchTaskSchema = z.object({
  title: z.string().min(1).optional(),
  status: statusSchema.optional(),
});

/** Provided: the tasks this app starts with. */
export const SEED: Task[] = [
  { id: "seed-1", title: "write the readme", status: "done" },
  { id: "seed-2", title: "ship it", status: "todo" },
];

export function createApp(): Express {
  throw new Error("ex3: createApp() is not implemented yet - edit this file.");
}
