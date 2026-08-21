// Shipped with the lesson - do not edit. The snippet printed in README ex1.

export function run(log: (label: string) => void): void {
  log("one");

  setTimeout(() => {
    log("two");
    process.nextTick(() => log("three"));
  }, 0);

  Promise.resolve().then(() => log("four"));
  process.nextTick(() => log("five"));
  setTimeout(() => log("six"), 0);

  log("seven");
}
