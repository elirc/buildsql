// d09_emitters / ex1 - a class that announces what it did.
// See lessons/d09_emitters/README.md, "Problem 1".
import { EventEmitter } from "node:events";

/**
 * A key/value store that emits:
 *   "change" (key, value, previous)  - only when the value really changed
 *   "delete" (key, value)            - only when there was something to delete
 */
export class Store extends EventEmitter {
  set(key: string, value: string): void {
    throw new Error("ex1: Store.set() is not implemented yet - edit this file.");
  }

  get(key: string): string | undefined {
    throw new Error("ex1: Store.get() is not implemented yet - edit this file.");
  }

  /** true if something was removed. */
  delete(key: string): boolean {
    throw new Error("ex1: Store.delete() is not implemented yet - edit this file.");
  }

  size(): number {
    throw new Error("ex1: Store.size() is not implemented yet - edit this file.");
  }
}
