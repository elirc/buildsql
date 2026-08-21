## Hint 1

Two types vary here, not one: what goes in and what comes out. They are
independent - a list of numbers can map to a list of strings - so you need two
type parameters.

Write the signature first and the body will be four lines.

## Hint 2

```ts
function convert<T, U>(items: readonly T[], transform: (item: T) => U): U[] { ... }
```

Both are inferred at the call site: `T` from the array, `U` from what the
callback returns. That is why `mapArray([1, 2], (n) => n.toFixed(1))` gives you
`string[]` without anyone writing `string` anywhere.

Inside, the accumulator has to be annotated `U[]`, or `push` will not know what
it is being handed.

## Hint 3

Declare `<T, U>`, take `readonly T[]` and `(item: T, index: number) => U`,
return `U[]`. Build the result with an indexed loop, calling
`transform(items[i], i)`.

Left to you: whether to reimplement the loop or delegate to `items.map(...)`.
Try the delegation and read the type it gives you back - and note that
`readonly T[]` has a `map` even though it has no `push`.
