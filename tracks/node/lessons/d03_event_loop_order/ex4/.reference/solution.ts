// d03_event_loop_order / ex4 - reference solution (author only, used by `dojo verify`).

export function scheduleLabels(log: (label: string) => void): void {
  log("sync");
  process.nextTick(() => log("tick"));
  queueMicrotask(() => log("micro"));
  setImmediate(() => log("check"));
  setTimeout(() => log("timer"), 0);
}
