## Hint 1

Two type-level pieces. First, a conditional type with `infer` that reads `T`
back out of a `(value: unknown) => value is T`. Second, a mapped type over
`keyof S` that applies it to every guard in the shape.

## Hint 2

The constraint on `S` should be loose - `Record<string, (value: unknown) => boolean>`
is enough. The predicates survive anyway, because `S` is inferred from the
object literal at the call site, and inference keeps the exact signatures.

## Hint 3

At runtime: reject non-objects first, then `Object.entries(shape)` and check
that every key is present *and* passes its guard. Checking presence separately
is what makes a missing key fail rather than being passed as `undefined` to a
guard that might accept it.

Left to you: whether extra keys should be rejected. The prompt says allow them;
the one-line change that would reject them is worth writing out to see what it
costs at every call site.
