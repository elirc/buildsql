## Hint 1

This is the semaphore from lesson 03 with a request attached: a count of what is
in flight, a FIFO queue of parked continuations, and three branches — take a
slot, join the queue, or be refused.

The parked continuation is the request's own `next`. Calling it later is what
"resuming" a request means; there is nothing else to store.

## Hint 2

The hard half is giving the slot back. There is no "handler finished" hook — the
handler may be async, may throw, may be replaced by an error handler — so hang
the release on the **response** instead: `res.on("finish")` for one that was
sent, `res.on("close")` for one whose client went away.

Both can fire for the same response, so guard with a boolean: releasing twice
raises your effective limit by one, permanently, and the symptom is a limiter
that quietly stops limiting.

## Hint 3

Release straight into the queue rather than through the counter. If you write
`active -= 1` and then look for a waiter, there is a window where `active` is
below `max` and a brand-new request can take the slot the waiter was owed — a
queue that is FIFO on paper and last-in-first-served under load.

The gate holds every handler open with a deferred it controls, so "two at once"
is counted, never timed.

What is left for you is the `Retry-After` value. The gate only insists that it
is there; choosing a number honestly — and whether it should grow with the
length of the queue — is the part a reviewer will want to talk about.
