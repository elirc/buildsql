// Shipped with the lesson - do not edit. The snippet printed in README ex2.

export function run(log: (label: string) => void): void {
  log("sync-1");

  process.nextTick(() => {
    log("tick-1");
    process.nextTick(() => log("tick-1-nested"));
  });

  Promise.resolve().then(() => {
    log("promise-1");
    process.nextTick(() => log("tick-from-promise"));
    Promise.resolve().then(() => log("promise-1-inner"));
  });

  queueMicrotask(() => log("microtask-2"));
  setTimeout(() => log("timeout"), 0);

  log("sync-2");
}
