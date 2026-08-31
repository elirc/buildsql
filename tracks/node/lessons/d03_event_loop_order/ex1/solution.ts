// d03_event_loop_order / ex1 - predict the four queues.
// See lessons/d03_event_loop_order/README.md, "Problem 1".
//
// ./snippet.ts:
//
//   log("A");
//   setTimeout(() => log("B"), 0);
//   process.nextTick(() => log("C"));
//   queueMicrotask(() => log("D"));
//   log("E");

/** The five labels, in the order they are logged. */
export function predictOrder(): string[] {
  throw new Error("ex1: predictOrder() is not implemented yet - edit this file.");
}
