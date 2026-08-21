// 09_express_fundamentals / challenge - the collection endpoint.
// See lessons/09_express_fundamentals/README.md, "Challenge".
import express, { type Express } from "express";

/** The data this app serves. Do not change it. */
export const ORDERS = [
  { id: "1", item: "keyboard", amount: 80, status: "paid" },
  { id: "2", item: "monitor", amount: 240, status: "pending" },
  { id: "3", item: "desk", amount: 410, status: "paid" },
  { id: "4", item: "mouse", amount: 25, status: "paid" },
  { id: "5", item: "chair", amount: 150, status: "cancelled" },
];

export function createApp(): Express {
  throw new Error("challenge: createApp() is not implemented yet - edit this file.");
}
