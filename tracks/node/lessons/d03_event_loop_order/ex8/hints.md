## Hint 1

Two loops: an outer one stepping `size` at a time through the array, and an
inner one over the items of one chunk. The results array is filled in place, in
order, so nothing needs sorting afterwards.

Count `yields` as you go rather than computing it at the end from the length —
the arithmetic version is where the off-by-one lives.

## Hint 2

"Hand the loop back" is not `await Promise.resolve()` and not `await null`.
Those are microtasks: they run inside the same checkpoint, before the loop
reaches any phase at all, so a pending `setImmediate` still does not get a turn.

What you want is a promise that resolves from a loop callback:

```ts
await new Promise<void>((resolve) => setImmediate(resolve));
```

## Hint 3

The gate pins the probe to exactly one position, which forces the placement of
the yield: the first chunk must run before you yield at all, and there must be
no yield after the last chunk.

"Yield at the top of every iteration except the first" gets both for free.
"Yield at the bottom of every iteration" gets neither. Pick one and check it
against the two numbers the gate asserts.
