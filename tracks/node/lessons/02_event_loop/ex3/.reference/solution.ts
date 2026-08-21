// 02_event_loop / ex3 - reference solution (author only, used by `dojo verify`).

export function scheduleAll(log: (label: string) => void): void {
  log("now");
  process.nextTick(() => log("tick"));
  queueMicrotask(() => log("micro"));
  setTimeout(() => log("later"), 0);
}
