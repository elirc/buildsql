// 09_express_fundamentals / ex2 - route parameters and query strings.
// See lessons/09_express_fundamentals/README.md, "Exercise 2".
import express, { type Express } from "express";

/** The data this app serves. Do not change it. */
export const ORDERS = [
  { id: "1", item: "keyboard", amount: 80, status: "paid" },
  { id: "2", item: "monitor", amount: 240, status: "pending" },
  { id: "3", item: "desk", amount: 410, status: "paid" },
];

export function createApp(): Express {
  throw new Error("ex2: createApp() is not implemented yet - edit this file.");
}
