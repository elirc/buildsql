## Hint 1

A mapped type does not have to keep the key it read. There is a clause that
renames each key as it goes, and combined with a template literal type it turns
`name` into `getName`.

The values change shape too: each one becomes a function returning what the
original member held.

## Hint 2

The type has three moving parts and they compose left to right in the header:

```ts
type Example<T> = { [K in keyof T & string as `on${Capitalize<K>}`]: () => T[K] };
```

`keyof T & string` drops number and symbol keys (a template literal type needs a
string); `as` renames the key; `Capitalize<K>` is a built-in that upper-cases
the first character of a string literal type.

At runtime you are building a plain object whose values are arrows closing over
`source`. Build it as a `Record<string, () => unknown>` and cast once on the way
out - the compiler cannot follow a name you assembled from a string.

## Hint 3

`Getters<T>` maps `[K in keyof T & string as ...]` to `() => T[K]`, with the new
key built from the literal `get` and `Capitalize<K>`.

For the body: loop `Object.keys(source)`, build the name with
`key.charAt(0).toUpperCase() + key.slice(1)`, and assign an arrow that returns
`source[key as keyof T]`.

Left to you: whether the arrow reads `source` at call time or captures the value
now. Those behave differently if the source is mutated afterwards, and only one
of them deserves the name "getter".
