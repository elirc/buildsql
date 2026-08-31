// d03_event_loop_order / ex6 - reference solution (author only, used by `dojo verify`).
//
// "sync" runs first, as always. Then the nextTick queue is drained to
// exhaustion - and each callback pushes another one onto it while it is being
// drained, so all three run back to back with nothing in between. Only when the
// queue finally empties does the microtask run, and only after the whole
// checkpoint does the loop reach the timers phase.

export function predictOrder(): string[] {
  return ["sync", "tick-1", "tick-2", "tick-3", "micro", "timer"];
}
