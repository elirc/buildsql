## Hint 1

Two separate obligations, and it is easy to satisfy one and not the other.

*Stop starting new work*: check `signal.aborted` at the top of the loop, and
once before the loop — an already-aborted signal must not write even the first
chunk.

*Stop waiting*: the `await` for a drain has to lose a race against the abort.
Waiting for a sink that has stopped moving is exactly the case cancellation
exists for, so a version that only checks the flag between chunks still hangs
for ever on a stalled upload.

## Hint 2

Build one promise that rejects with `signal.reason` when the `abort` event
fires, and race the drain wait against it. Create it once, outside the loop —
one listener per call, not one per chunk.

Give it a no-op `.catch()` as soon as you make it. On the happy path nobody ever
awaits that promise, and an abort arriving after the writes are done would
otherwise be reported as an unhandled rejection.

Remove the listener in a `finally`, so it goes on the abort path, the error path
and the success path alike. A long-lived signal — a request signal shared by
twenty helpers — collects one listener per call otherwise, and Node starts
printing `MaxListenersExceededWarning` at eleven.
