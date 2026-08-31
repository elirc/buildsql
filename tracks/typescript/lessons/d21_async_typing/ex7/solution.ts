// d21_async_typing / ex7 - at most n at a time.
// See lessons/d21_async_typing/README.md, "ex7".
//
// The stub throws when the queue is created, so nothing is ever
// added.

export interface Queue {
  add<T>(task: () => Promise<T>): Promise<unknown>;
}

export function createQueue(limit: number): Queue {
  throw new Error("ex7: createQueue() is not implemented yet - edit this file.");
}
