## Hint 1

Narrate the design before you type: start `limit` runners, each pulling the
next index off a shared cursor until the list is exhausted, storing its result
by index. That gives you the ceiling, input-ordered results, and a slot that
refills the moment one frees - all three at once.

The chunking answer (slice into groups of `limit`, await each group) fails the
gate on purpose, and being able to say *why* is half the interview: every
chunk takes as long as its slowest member.

## Hint 2

The fail-fast requirement is what is new here. When a worker rejects:

- the whole `mapLimit` call must reject with that error, and
- no further items may be started.

`Promise.all` gives you the first for free - it rejects as soon as any runner
rejects. The second needs a shared flag that the runners check before taking
another item, because the other runners are mid-loop and `Promise.all`
rejecting does not stop them.

## Hint 3

```ts
const results = new Array<R>(items.length);
let next = 0;
let failed = false;

const runner = async (): Promise<void> => {
  while (next < items.length && /* still worth continuing? */) {
    const index = next;
    next += 1;
    try {
      results[index] = await worker(items[index], index);
    } catch (error) {
      failed = true;
      throw error;
    }
  }
};
```

Two decisions left: the loop condition, and how many runners to start
(`limit`, clamped so that four items and a limit of ten does not start ten).
Note the cursor is read and incremented *before* the `await` - two runners can
never claim the same index because nothing can interleave between those two
statements on a single thread. Say that in the room; it is the detail that
shows you understand why this is safe here and would need a lock elsewhere.
