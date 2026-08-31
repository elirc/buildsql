// d03_event_loop_order / ex1 - reference solution (author only, used by `dojo verify`).
//
// A and E are synchronous, so they run before anything is scheduled at all.
// Then the checkpoint: the nextTick queue first (C), then the microtask queue
// (D). The timer (B) belongs to a later phase of the loop entirely.

export function predictOrder(): string[] {
  return ["A", "E", "C", "D", "B"];
}
