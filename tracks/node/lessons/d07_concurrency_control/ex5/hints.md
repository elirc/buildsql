## Hint 1

The pool shape: start `limit` runners, each looping "claim the next index, do
it, repeat" until the indexes run out. Nothing is batched, so a slot frees the
instant one worker settles rather than when a group does.

Results go into a pre-sized array **by index**, which is what keeps input order
without any sorting.

## Hint 2

The shared cursor is the trick worth naming:

```ts
const index = next;
next += 1;
```

There is no `await` between those two lines, so no two runners can ever claim
the same index. JavaScript being single threaded is doing real work for you
here — the identical code in Java or Go needs an atomic increment.

## Hint 3

The `try`/`catch` goes **inside** the runner loop, around the single `await
worker(...)`. That is what turns a failure into a record and lets the loop carry
on to the next index.

Wrapping the whole runner, or the final `Promise.all`, gets you a limiter that
stops on the first error — a different function with different semantics. Two
decisions are left: how many runners to start when there are fewer items than
`limit` (starting `limit` of them works, and think about what the extra ones
do), and whether `reason` should be normalised to an `Error` the way `attempt`
did in d06.
