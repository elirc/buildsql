## Hint 1

An async generator that loops over the sources in order, plus `Readable.from()`
to turn it back into a stream, is the entire implementation. The laziness you
are asked for is a property of the generator: code after the first loop has not
run yet, so the second source has not even been subscribed to.

## Hint 2

`yield* source` inside the generator delegates to the source's async iterator —
items, end, and error all handled. The version to avoid is attaching `data`
listeners to every source up front and switching between them: attaching a
listener **starts** a stream, which is precisely what the gate's `secondRead`
flag catches. Error handling comes free too: a source that errors rejects the
pending `next()`, the generator throws, and `Readable.from` destroys the joined
stream with that error rather than quietly ending early.
