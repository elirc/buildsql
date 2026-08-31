// d03_event_loop_order / ex7 - a chain is not a block.
// See lessons/d03_event_loop_order/README.md, "Problem 7".
//
// ./snippet.ts:
//
//   Promise.resolve()
//     .then(() => log("p1"))
//     .then(() => log("p2"))
//     .then(() => log("p3"));
//   queueMicrotask(() => log("q1"));
//   queueMicrotask(() => log("q2"));
//   const job = async () => {
//     log("a-start");
//     await Promise.resolve();
//     log("a-1");
//     await Promise.resolve();
//     log("a-2");
//   };
//   void job();
//   log("sync");

/** The nine labels, in the order they are logged. */
export function predictOrder(): string[] {
  throw new Error("ex7: predictOrder() is not implemented yet - edit this file.");
}
