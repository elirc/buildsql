## Hint 1

The element type is a tuple, so the return type is an array *of* that tuple:
`[value: number, count: number][]`. Write it once on the accumulator and once
as the return type, and the body will typecheck itself.

## Hint 2

Walk the input once, looking only at the last pair you pushed. If its value
equals the current one, bump the count; otherwise push a fresh `[value, 1]`.

`runs[runs.length - 1]` is `undefined` on the first iteration, so compare it
against `undefined` before reading `last[0]`.

Left to you: mutate the last tuple in place, or rebuild it. Mutating is
shorter; rebuilding is what you would do if the pairs were `readonly`.
