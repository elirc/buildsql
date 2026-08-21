## Hint 1

`bestOf([1, 2, 3])` and `bestOf(1, 2, 3)` are different function signatures,
and the gate calls the second one. Only one character stands between them.

The other decision is what `bestOf()` - no arguments at all - should hand back.
The README states it; it is not `undefined` and it is not `-Infinity`.

## Hint 2

The rest parameter collects every remaining argument into an array:

```ts
function join(separator: string, ...parts: string[]): string { ... }
```

Inside the body, `parts` is an ordinary `string[]`. A rest parameter must be
last, and there can only be one.

For the body: a running maximum, seeded so that the no-arguments case already
gives the answer the README asks for.

## Hint 3

Write `...scores: number[]`, seed the running best at `0`, loop, and keep the
larger value. Because the seed is `0`, an empty call returns `0` without a
special case - which is why the README chose that rule.

The decision left to you: whether the seed doubles as the empty-case answer
(as above) or whether you guard `scores.length === 0` explicitly. One of those
two survives a later change to the rule better than the other.
