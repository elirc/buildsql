// 02_event_loop / ex2 - reference solution (author only, used by `dojo verify`).

export function predictOrder(): string[] {
  return [
    "sync-1",
    "sync-2",
    "tick-1",
    "tick-1-nested",
    "promise-1",
    "microtask-2",
    "promise-1-inner",
    "tick-from-promise",
    "timeout",
  ];
}
