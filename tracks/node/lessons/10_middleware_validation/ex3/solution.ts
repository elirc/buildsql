// 10_middleware_validation / ex3 - one error handler, at the bottom.
// See lessons/10_middleware_validation/README.md, "Exercise 3".
import express, { type Express } from "express";

/** An error the client is allowed to be told about. */
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

/** The data this app serves. Do not change it. */
export const ORDERS = [
  { id: "1", item: "keyboard" },
  { id: "2", item: "monitor" },
];

export function createApp(logError: (error: unknown) => void = () => {}): Express {
  throw new Error("ex3: createApp() is not implemented yet - edit this file.");
}
