## Hint 1

The tempting design is "slice the array into chunks of `limit` and await each
chunk". It is three lines and it fails the gate on purpose: with a chunk of
[1, 2], finishing 2 does not start 3, because the chunk is not done until 1
finishes too. A slow item in a chunk leaves a worker idle.

The design that works inverts the loop. Instead of iterating over items and
managing workers, start exactly `limit` workers and let each one pull the next
item whenever it is free.

## Hint 2

Shared state: a cursor (`let next = 0`) and a results array sized to the input.

Each worker is an async function with a `while` loop: take the current cursor
value, move the cursor on, await the work for that index, store the result at
that index, repeat until the cursor runs off the end. Because you increment
the cursor *before* awaiting, two workers never take the same item.

Then start `limit` of those and `await Promise.all([...])` on them. The
results land by index, which is why the output is in input order even though
the work finished out of order.

## Hint 3

The skeleton:

```ts
const results = new Array<R>(items.length);
let next = 0;

const runner = async (): Promise<void> => {
  while (next < items.length) {
    const index = next;
    next += 1;
    results[index] = await worker(items[index], index);
  }
};

await Promise.all(Array.from({ length: /* how many? */ }, () => runner()));
return results;
```

The decision left to you is how many runners to start. `limit` is the obvious
answer and it is nearly right - think about what happens when `limit` is 10
and there are 2 items, and about what a `limit` of 0 would do. Clamping it to
something sane is part of the exercise.
