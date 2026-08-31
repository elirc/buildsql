## Hint 1

Two listeners racing to settle one promise: one on the emitter, one on the
signal's `"abort"` event. Whichever fires first wins, and the promise ignores
the loser — no flag needed.

An `AbortSignal` is an `EventTarget`, so it is `addEventListener("abort", ...)`
rather than `.on`.

## Hint 2

The early return is not an optimisation. A signal that is *already* aborted
means the caller has gone; attaching a listener to the emitter and then removing
it in the same tick would work, but attaching nothing is both simpler and
honest about what happened.

`signal.reason` is what to reject with in both cases — it is whatever was passed
to `abort()`, and defaults to an `AbortError` when nothing was.

## Hint 3

One `cleanup()` removing **both** listeners, called from both settling paths.

The emitter listener is the obvious one. The abort listener is the one people
forget, and it matters more: a request-scoped signal typically outlives dozens
of these calls, so one leaked listener per call is how you end up reading
`MaxListenersExceededWarning` in production logs.

The remaining decision is whether an `"error"` event on the emitter should also
reject this promise, the way it does in ex2. This version says no; know that you
chose it.
