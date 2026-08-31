## Hint 1

`T[keyof T]` indexes the type by *all* of its keys at once, which unions the
value types: `{ a: number; b: string }` gives `number | string`.

That is the element type of the array you return.

## Hint 2

`Object.values(source)` is typed `any[]` for a generic `T` - it looks right and
loses everything.

`Object.keys` is typed `string[]` on purpose (a value may always carry more
properties than its type declares), so one cast to `(keyof T)[]` is the accepted
answer, and the `map` after it is fully typed.

Left to you: cast the keys and map, or cast the result of `Object.values`. One
of those two casts is a claim you can justify.
