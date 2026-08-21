## Hint 1

Same keys, new values. Two type parameters: the source object type and whatever
the transform produces. `Record<keyof T, U>` is the return type, which says "the
same keys, all of them, holding `U`".

The transform receives the value and the key, in that order.

## Hint 2

```ts
function mapValues<T extends object, U>(
  source: T,
  transform: (value: T[keyof T], key: keyof T & string) => U,
): Record<keyof T, U> { ... }
```

`Object.keys` is typed `string[]` rather than `(keyof T)[]` - deliberately,
because a value can always have more properties than its type declares - so
iterating needs one cast. Keep it on the loop and nowhere else.

The accumulator needs `{} as Record<keyof T, U>` for the same reason
`pickKeys` did in lesson 08: an object under construction is not yet the type
it will be.

## Hint 3

Cast the key list, loop it, and assign `transform(source[key], key)` into the
accumulator.

Left to you: whether to reach for `Object.fromEntries(Object.entries(source)
.map(...))` instead. It is one line and it hands you back
`{ [k: string]: U }` - so you trade a loop for a cast, which is the kind of
trade worth being able to justify out loud.
