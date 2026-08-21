## Hint 1

Two separate problems, and only one of them is about the event loop.

The boring one: walk the array in chunks of `batchSize`, call `handle` for
every item in order, and count the chunks. A `for` loop whose counter goes up
by `batchSize` is the usual shape.

The interesting one: between chunks, you have to actually give the loop a
turn. The gate proves you did by queueing a callback of its own before calling
you and checking that it ran somewhere in the middle of your work.

## Hint 2

"Give the loop a turn" has a precise meaning, and the near-miss is worth
knowing: `await Promise.resolve()` does **not** do it. A microtask is drained
before the loop moves on, so nothing else - no timer, no I/O completion, no
`setImmediate` - gets a chance to run. That is the version the gate catches by
seeing its own callback run last.

What you want is a promise that settles from a *macrotask*:

```ts
await new Promise<void>((resolve) => setImmediate(resolve));
```

`setTimeout(resolve, 0)` works too, and both are worth knowing.

## Hint 3

Skeleton:

```ts
let yields = 0;
for (let start = 0; start < items.length; start += batchSize) {
  for (const item of items.slice(start, start + batchSize)) {
    handle(item);
  }
  yields += 1;
  await /* the yield from Hint 2 */;
}
return yields;
```

Two decisions left: which yield you use, and whether the empty-array case
falls out of this loop correctly. Walk through it with `items = []` before you
run the gate - how many times does the body execute, and what do you return?
