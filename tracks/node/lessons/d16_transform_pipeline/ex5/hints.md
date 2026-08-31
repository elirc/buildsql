## Hint 1

`pipeline()` accepts three kinds of middle stage: a `Transform`, a duplex, and
an **async generator function** taking the source as its only argument. So the
whole answer is a function that returns another function — and the inner one is
`async function*`.

## Hint 2

Four lines: `for await (const item of source) { yield await fn(item); }`.

Read what that buys you. The `await` inside the loop means the next item is not
pulled until this one has been handed downstream, so the order is the input
order without any bookkeeping, and only one call to `fn` is ever outstanding.

The failure behaviour is free too: when `fn` rejects, the `for await` loop
unwinds, the generator ends, `pipeline()` rejects, and the source stops being
pulled. Compare that with collecting promises in an array first, where a
rejection arrives long after the source has been drained.
