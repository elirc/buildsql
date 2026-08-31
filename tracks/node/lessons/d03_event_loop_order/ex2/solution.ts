// d03_event_loop_order / ex2 - callbacks that schedule more callbacks.
// See lessons/d03_event_loop_order/README.md, "Problem 2".
//
// ./snippet.ts:
//
//   process.nextTick(() => {
//     log("tick-1");
//     queueMicrotask(() => log("micro-from-tick"));
//   });
//   queueMicrotask(() => {
//     log("micro-1");
//     process.nextTick(() => log("tick-from-micro"));
//   });
//   process.nextTick(() => log("tick-2"));
//   log("sync");

/** The six labels, in the order they are logged. */
export function predictOrder(): string[] {
  throw new Error("ex2: predictOrder() is not implemented yet - edit this file.");
}
