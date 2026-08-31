## Hint 1

Two requirements pull against each other: several workers at once, but output in
input order. Hold one FIFO queue of **started promises**, in the order the items
arrived. The head of that queue is the only thing that may be emitted next.

## Hint 2

Everything follows from when you call the transform callback.

Calling it immediately means "give me the next chunk", so the number of
outstanding callbacks is exactly the number of workers in flight. Start the
worker, push its promise on the queue, and then:

- queue shorter than `limit` → call the callback straight away;
- queue at `limit` → wait for `queue[0]`, push its value, shift it off, *then*
  call the callback.

`_flush` drains whatever is still queued, in order.

## Hint 3

Note which promise you wait on when you are at capacity. Waiting on the one you
just started, or racing them all, both give you the limit — and both destroy the
ordering, because the slot is freed by whoever finishes rather than by whoever
is next in line.

Attach a no-op `.catch()` to each promise as you start it. Its real rejection is
delivered later, when it reaches the head; without the placeholder Node reports
an unhandled rejection in the meantime.

What is left for you is what should happen to the workers still in flight when
one of them rejects — the gate only checks that nothing *new* starts.
