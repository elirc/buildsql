## Hint 1

A mapped type is a `for` loop over the keys of a type. The README's Concept
section shows the syntax; the two you have to write differ only in *which* keys
they loop over and whether they add a `?`.

`MyPartial` walks every key of `T`. `MyPick` walks only the keys in `K`.

## Hint 2

```ts
type Mapped<T> = { [K in keyof T]: T[K] };   // an exact copy of T
```

Add `?` after the bracket to make each member optional. To loop over a
different key set, put that union in place of `keyof T` - `K` is already
constrained to be a subset of `T`'s keys, so `[P in K]` is legal.

For the body of `pickKeys`, you need an accumulator the compiler will let you
write into. `{} as MyPick<T, K>` is the pragmatic idiom, and the reading
explains why an honest version is so awkward.

## Hint 3

`MyPartial<T>` is `{ [K in keyof T]?: T[K] }`. `MyPick<T, K>` is
`{ [P in K]: T[P] }`. Then loop over `keys`, assigning `source[key]` into the
accumulator.

Left to you: whether to reach for the cast at all. Try building the object with
`Object.fromEntries` instead and look at the type it hands back - it is a
perfect illustration of where TypeScript's inference gives up and why the
standard library's own implementations use casts too.
