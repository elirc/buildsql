## Hint 1

Same two operators as ex1, arranged differently. The map's *keys* are the values
found at the chosen property, and the map's *values* are the whole items.

Write the return type before the body - it tells you what to construct.

## Hint 2

`Map<T[K], T>` is the type: keys of type `T[K]`, values of type `T`. Construct
it with `new Map<T[K], T>()` so the compiler checks every `set` call against
those types.

Then one pass over `items`, setting `item[key]` to `item`.

## Hint 3

Signature: `indexBy<T, K extends keyof T>(items: readonly T[], key: K): Map<T[K], T>`.
Body: build the map, loop, `index.set(item[key], item)`, return it.

Left to you: what happens when two items share a key. A `Map` overwrites, so
the last one wins - the opposite of `uniqueBy` in lesson 06. Whether that is
right depends on the caller, which is why the README says it out loud and the
gate checks it.
