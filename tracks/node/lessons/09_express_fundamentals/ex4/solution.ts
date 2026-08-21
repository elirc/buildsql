// 09_express_fundamentals / ex4 - routers, mounted.
// See lessons/09_express_fundamentals/README.md, "Exercise 4".
import express, { type Express } from "express";

/** The data this app serves. Do not change it. */
export const ORDERS = [
  { id: "1", item: "keyboard", amount: 80, status: "paid" },
  { id: "2", item: "monitor", amount: 240, status: "pending" },
];

export function createApp(): Express {
  throw new Error("ex4: createApp() is not implemented yet - edit this file.");
}
