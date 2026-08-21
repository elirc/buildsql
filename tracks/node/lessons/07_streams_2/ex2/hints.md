## Hint 1

There is a promise-flavoured `pipeline` in `node:stream/promises`. It takes the
stages in order - source first, sink last - wires them together with
backpressure, and returns a promise that resolves when the last one finishes
or rejects if any of them fails.

That is the entire exercise. The interesting part is what it does that
`a.pipe(b).pipe(c)` does not, and the gate checks for it.

## Hint 2

Two forms are available:

```ts
await pipeline(source, transform, sink);      // as separate arguments
await pipeline([source, ...transforms, sink]); // as one array
```

You are handed an *array* of transforms of unknown length, so the second form
is the one that fits: spread the transforms between the source and the sink.

Do not add `.on("error")` handlers of your own, and do not wrap it in a
`try`/`catch` that swallows - the caller wants the rejection.

## Hint 3

The body is one line. The decision left to you is the assembly of the array,
and whether you `await` it or return it directly (both work - `await` inside
an `async` function that declares `Promise<void>` is the clearer of the two).

If the gate tells you the sink was not destroyed, you probably reached for
`.pipe()`: `.pipe()` returns the destination for chaining but does *not*
forward errors or clean up the other streams, which is why every modern Node
codebase uses `pipeline` instead.
