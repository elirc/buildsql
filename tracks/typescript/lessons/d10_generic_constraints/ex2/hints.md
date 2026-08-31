## Hint 1

`T extends { id: string }` is what lets the body compare ids - and the return
type stays `T[]`, so the caller keeps every other member of their own type.

## Hint 2

Two different outcomes, so find the position first. `findIndex` returns `-1`
when nobody matches, which is the append case; otherwise map by index so the
replacement lands exactly where the old item was.

`readonly T[]` in the parameter is what stops you reaching for `splice`.

Left to you: `map` by index, or `slice` around the position and spread. Both
build a new array - pick the one whose intent survives a code review.
