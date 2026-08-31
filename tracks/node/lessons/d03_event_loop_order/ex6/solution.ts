// d03_event_loop_order / ex6 - a queue that refills itself.
// See lessons/d03_event_loop_order/README.md, "Problem 6".
//
// ./snippet.ts:
//
//   let depth = 0;
//   const tick = () => {
//     depth += 1;
//     log(`tick-${depth}`);
//     if (depth < 3) process.nextTick(tick);
//   };
//   process.nextTick(tick);
//   queueMicrotask(() => log("micro"));
//   setTimeout(() => log("timer"), 0);
//   log("sync");

/** The six labels, in the order they are logged. */
export function predictOrder(): string[] {
  throw new Error("ex6: predictOrder() is not implemented yet - edit this file.");
}
