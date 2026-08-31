## Hint 1

The `new Promise` constructor is the right tool here — you are building a
promise out of N others, not wrapping one you already have. Inside it you need
two pieces of state: a results array and a count of how many are still
outstanding.

Attach a handler to each input with its index captured, write the value at that
index, decrement, and resolve when the count reaches zero.

## Hint 2

Two cases people miss.

The empty array has to resolve **immediately**. A count that starts at zero
never reaches zero by decrementing, so the promise hangs forever unless you
check up front.

And the rejection path is simply `reject` passed straight through as the second
argument to every `.then`. The first one to fire settles the promise; the rest
are no-ops, because a settled promise ignores later settlements — which is why
you do not need a `done` flag of your own.

## Hint 3

Counting rather than checking `results.length` matters: an array written by
index is *sparse* until the last hole is filled, and `results.length` is the
full length from the moment it is constructed. `Object.keys(results).length`
would work and is slower and stranger than a counter.

The remaining decision is whether to accept plain values mixed in with the
promises the way the real `Promise.all` does. The gate only passes promises;
adding it is one line, and knowing which line is the point.
