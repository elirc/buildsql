## Hint 1

Two synchronous labels, then the queues. The async function is called, not
awaited, so its body runs immediately up to the `await` - which means one of
its labels is synchronous and one is not.

Then the usual order: the nextTick queue first, then the microtask queue.

## Hint 2

The microtask queue is first-in-first-out, so the order of the two microtasks
is the order they were *queued*, not the order they appear in the source.

The continuation of the async function is queued the moment it reaches its
`await`, which happens during the synchronous pass - before the line below it
runs at all.

## Hint 3

Five strings. Two synchronous, one nextTick, two microtasks.

The decision left to you is the order of those last two, and it is decided by
which one was queued first. Trace the synchronous pass line by line and write
down each queueing as it happens; the answer falls out.
