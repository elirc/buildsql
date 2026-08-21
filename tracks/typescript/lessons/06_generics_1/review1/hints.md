## Hint 1

Same shape as ex1 with the fallback supplied by the caller instead of being
`undefined`. That changes the return type for the better: there is no empty
case to hand back nothing for, so the caller never has to check.

Both parameters share the one type parameter. That is the point of the
exercise.

## Hint 2

```ts
function firstOr<T>(items: readonly T[], fallback: T): T { ... }
```

Because `fallback` is also `T`, calling `lastOr([1, 2], "none")` is a compile
error - the two arguments have to agree. Read that error once; it is the most
useful thing a generic signature does for a caller.

## Hint 3

Declare `<T>`, take `readonly T[]` and a `T` fallback, return `T`. Empty list
gives the fallback; otherwise index the last element.

Left to you: `items[items.length - 1]` or `items.at(-1)`. The second returns
`T | undefined`, which your return type will not accept - deciding how to
respond to that is the whole exercise in miniature.
