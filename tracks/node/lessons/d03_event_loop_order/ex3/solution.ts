// d03_event_loop_order / ex3 - an async function is a scheduling instruction.
// See lessons/d03_event_loop_order/README.md, "Problem 3".
//
// ./snippet.ts:
//
//   const inner = async () => {
//     log("inner-start");
//     await null;
//     log("inner-end");
//   };
//   const outer = async () => {
//     log("outer-start");
//     await inner();
//     log("outer-end");
//   };
//   void outer();
//   Promise.resolve()
//     .then(() => log("then-1"))
//     .then(() => log("then-2"));
//   log("sync-end");

/** The seven labels, in the order they are logged. */
export function predictOrder(): string[] {
  throw new Error("ex3: predictOrder() is not implemented yet - edit this file.");
}
