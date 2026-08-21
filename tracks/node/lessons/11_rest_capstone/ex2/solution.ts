// 11_rest_capstone / ex2 - the read endpoints.
// See lessons/11_rest_capstone/README.md, "Exercise 2".
import express, { type Express } from "express";

export type TaskStatus = "todo" | "doing" | "done";

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
}

/** Provided: the tasks this app starts with, and the allowed statuses. */
export const STATUSES: readonly TaskStatus[] = ["todo", "doing", "done"];

export const SEED: Task[] = [
  { id: "seed-1", title: "write the readme", status: "done" },
  { id: "seed-2", title: "ship it", status: "todo" },
  { id: "seed-3", title: "review the pull request", status: "doing" },
];

export function createApp(): Express {
  throw new Error("ex2: createApp() is not implemented yet - edit this file.");
}
