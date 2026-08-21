## Hint 1

Four combinators, and only one of them means "the first task that *succeeds*":

- `all` - every one, or the first failure;
- `allSettled` - every one, never fails;
- `race` - the first to settle either way, so a fast failure wins;
- `any` - the first to fulfil, and it only rejects when they all do.

Pick the one that matches the prompt, and remember you were handed functions
again: nothing starts until you call them.

## Hint 2

`Promise.any` rejects with an `AggregateError` whose `.errors` array holds
every rejection - but the gate wants a specific message,
`all tasks failed: x, y`, with the messages in *input* order.

`AggregateError.errors` is in input order too, so one option is to catch the
aggregate and build the string from it. Another is to record each rejection as
it happens by attaching a `.catch` to each task that notes the message and
rethrows. Both are fine; the second is worth writing once because it is the
shape you use whenever you need per-task bookkeeping.

## Hint 3

The skeleton, using the second option:

```ts
const messages: string[] = [];
const running = tasks.map((task, index) =>
  task().catch((error: unknown) => {
    messages[index] = /* the message */;
    throw error;              // <- do not swallow it
  }),
);

try {
  return await Promise.any(running);
} catch {
  throw new Error(`all tasks failed: ${/* join them how? */}`);
}
```

Two decisions left: how you turn an unknown thrown value into a string, and
the exact join. The gate wants `", "` between messages and nothing else. Note
the rethrow inside the `.catch` - without it every task "succeeds" with
`undefined` and `Promise.any` resolves with nothing.
