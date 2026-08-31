// d03_event_loop_order / ex2 - reference solution (author only, used by `dojo verify`).
//
// "sync" first. Then the checkpoint drains the whole nextTick queue: tick-1
// (which pushes a microtask onto a queue that has not started yet) and tick-2.
// Only then are microtasks run, in the order they were queued: micro-1 (queued
// during the synchronous code) before micro-from-tick. micro-1 pushes onto the
// nextTick queue, which is already empty - so the checkpoint goes round again
// and picks it up.

export function predictOrder(): string[] {
  return ["sync", "tick-1", "tick-2", "micro-1", "micro-from-tick", "tick-from-micro"];
}
