// 09_express_fundamentals / ex1 - your first express app.
// See lessons/09_express_fundamentals/README.md, "Exercise 1".
import express, { type Express } from "express";

/** The data this app serves. Do not change it. */
export const ORDERS = [
  { id: "1", item: "keyboard", amount: 80, status: "paid" },
  { id: "2", item: "monitor", amount: 240, status: "pending" },
];

export function createApp(): Express {
  throw new Error("ex1: createApp() is not implemented yet - edit this file.");
}
