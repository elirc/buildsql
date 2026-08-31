## Hint 1

The stub guards with state, and the guard is correct one render too late.
Trace two clicks that both happen before React re-renders: both handlers read
the same `sending`, both see `false`, and the `disabled` attribute is still not
in the DOM when the second click is dispatched.

## Hint 2

You need a value that is true the instant the first click is handled, not after
the next render. Keep the state as well — it is what draws the disabled button
and the message — and let the ref be the thing the code actually tests.

## Hint 3

Whatever sets the guard has to clear it when the request settles, on both the
success and the failure path, or the button is dead after one failed payout.
