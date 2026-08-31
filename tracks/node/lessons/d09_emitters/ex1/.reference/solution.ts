// d09_emitters / ex1 - reference solution (author only, used by `dojo verify`).
import { EventEmitter } from "node:events";

export class Store extends EventEmitter {
  readonly #entries = new Map<string, string>();

  set(key: string, value: string): void {
    const previous = this.#entries.get(key);
    // An event for something that did not change is noise, and noise is what
    // makes people stop listening.
    if (this.#entries.has(key) && previous === value) return;
    this.#entries.set(key, value);
    this.emit("change", key, value, previous);
  }

  get(key: string): string | undefined {
    return this.#entries.get(key);
  }

  delete(key: string): boolean {
    const value = this.#entries.get(key);
    if (!this.#entries.delete(key)) return false;
    this.emit("delete", key, value);
    return true;
  }

  size(): number {
    return this.#entries.size;
  }
}
