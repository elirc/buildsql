## Hint 1

Three pieces of state and one list: the state (`pending` / `fulfilled` /
`rejected`), the value, the reason, and the handlers registered while it was
still pending.

`then` is then an `if`: pending means push onto the list, settled means deliver
now. `resolve` and `reject` are the same function with a different label, so
write one `settle(state, payload)` and have both call it.

## Hint 2

"Deliver now" cannot mean "call the handler now". The asynchrony guarantee is
the single most load-bearing property of a promise — an API that is sometimes
synchronous and sometimes not creates races that only show up under load — and
the gate checks it twice: once for handlers registered before `resolve`, once
for handlers registered after.

`queueMicrotask` is exactly the right tool. Wrap the *delivery* in it, not the
whole of `then`, or you lose the ordering.

## Hint 3

Two details finish it.

Ordering: schedule the waiting handlers in the order they were registered, one
microtask each. Because microtasks are FIFO, scheduling in order is delivering
in order — you do not need to do anything cleverer.

Idempotence: `settle` returns immediately if the state is not `pending`. That
one line is what makes "the first settlement wins" true, and it is the same
guard as ex1 and ex7.

The remaining decision is what happens to the waiting list after settling. Ask
whether keeping the entries around could hold a large captured value alive
longer than anybody wanted.
