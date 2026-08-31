## Hint 1

A `Map` from key to sink is the whole routing table. `for await` over the
source, compute the key, look it up, and open one only when the lookup misses —
`openSink` is creating a file, so calling it per item rather than per key is how
a partitioned export produces four million of them.

## Hint 2

Ending is not finishing. `sink.end()` says "no more data"; the bytes are not
necessarily on the disk until the stream emits `finish`. `finished(sink)` from
`node:stream/promises` gives you a promise for that moment — collect one per
sink as you open it, and await them all before you resolve.

## Hint 3

The failure path is what makes this an ex8. Three things can go wrong: the
source can fail, a sink can fail, and `keyOf` can throw. All three have to end
the same way — every sink **destroyed** rather than ended, the source destroyed,
and the first error thrown.

A sink failing while you are still reading the source is the awkward one,
because you are not awaiting anything at that moment. Attach a handler to each
`finished()` promise when you create it, have it record the failure and destroy
everything, and check that flag as you loop.

`Promise.allSettled` rather than `Promise.all` at the end: on the failure path
several of those promises have rejected, and you want the first real error, not
a race between teardown errors. Which of the three failures deserves to be the
one reported when two arrive together is a decision the gate leaves to you.
