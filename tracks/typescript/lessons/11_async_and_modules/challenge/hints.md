## Hint 1

This is the capstone, so it uses most of the track: a generic type parameter, a
discriminated union for the per-task outcome, `unknown` in a `catch`, and
promises that must overlap without all starting at once.

Read the four rules in the README and write them down as four separate
problems. Solve "results in input order" and "never more than `limit` running"
last - they are the two that interact.

## Hint 2

The shape that satisfies both ordering and the limit is a small worker pool:

```ts
const results: TaskResult<T>[] = new Array(tasks.length);
let next = 0;

async function worker() {
  while (next < tasks.length) {
    const index = next++;
    // run tasks[index], store into results[index]
  }
}

await Promise.all(workers);   // `limit` workers, each pulling the next index
```

Because each worker writes to `results[index]`, order is preserved no matter
which finishes first. Because there are only `limit` workers, no more than
`limit` tasks are ever in flight.

Under `useUnknownInCatchVariables` the caught value is `unknown`, so narrow with
`instanceof Error` before reading `.message`.

## Hint 3

Finish `TaskResult<T>` with its failure variant, guard the bad `limit` with the
exact message from the README, build a `results` array the length of `tasks`,
and start `Math.min(limit, tasks.length)` workers that each loop while indexes
remain. Wrap each task call in `try`/`catch` and store the right variant.

Left to you: what a *rejected* task should do to the others. This design lets
them all finish - the opposite of `Promise.all`'s fail-fast. Deciding which
behaviour a caller wants, and being able to say why, is most of what this
capstone is testing.
